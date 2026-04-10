using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using PrintCraftApi.Models;
using Stripe;
using Stripe.Checkout;

namespace PrintCraftApi.Services;

public class StripePendingPaymentReconciler : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromMinutes(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<StripePendingPaymentReconciler> _logger;

    public StripePendingPaymentReconciler(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<StripePendingPaymentReconciler> logger)
    {
        _scopeFactory = scopeFactory;
        _configuration = configuration;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Stripe pending payment reconciler started.");

        await ReconcilePendingPaymentsAsync(stoppingToken);

        using var timer = new PeriodicTimer(PollInterval);
        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            await ReconcilePendingPaymentsAsync(stoppingToken);
        }

        _logger.LogInformation("Stripe pending payment reconciler stopped.");
    }

    private async Task ReconcilePendingPaymentsAsync(CancellationToken cancellationToken)
    {
        try
        {
            var stripeSecretKey = _configuration["StripeSecretKey"];
            if (string.IsNullOrWhiteSpace(stripeSecretKey))
            {
                _logger.LogWarning("StripeSecretKey is missing. Skipping pending payment reconciliation.");
                return;
            }

            StripeConfiguration.ApiKey = stripeSecretKey;
            var sessionService = new SessionService();

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<PrintCraftDb>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
            var discordWebhookService = scope.ServiceProvider.GetRequiredService<IDiscordWebhookService>();

            var pendingPayments = await db.Payments
                .Include(p => p.Order)
                .ThenInclude(o => o!.Items)
                .Where(p => p.Provider == "stripe"
                    && p.Order != null
                    && p.Order.Status == "pending_payment"
                    && !p.Order.IsPaid
                    && p.ProviderPaymentId != null)
                .OrderBy(p => p.CreatedAt)
                .Take(100)
                .ToListAsync(cancellationToken);

            if (pendingPayments.Count == 0)
                return;

            var now = DateTime.UtcNow;
            var paidOrderIds = new List<Guid>();

            foreach (var payment in pendingPayments)
            {
                var order = payment.Order;
                if (order == null || string.IsNullOrWhiteSpace(payment.ProviderPaymentId))
                    continue;

                Session stripeSession;
                try
                {
                    stripeSession = await sessionService.GetAsync(payment.ProviderPaymentId, new SessionGetOptions
                    {
                        Expand = new List<string> { "payment_intent" }
                    }, cancellationToken: cancellationToken);
                }
                catch (StripeException ex)
                {
                    _logger.LogWarning(ex, "Failed retrieving Stripe session {SessionId} for order {OrderId}", payment.ProviderPaymentId, order.Id);
                    continue;
                }

                var previousOrderStatus = order.Status;
                var wasAlreadyPaid = order.IsPaid;

                payment.Method ??= stripeSession.PaymentMethodTypes?.FirstOrDefault();
                payment.Status = NormalizeStripeStatus(stripeSession.Status, stripeSession.PaymentStatus);
                payment.UpdatedAt = now;

                var isPaid = string.Equals(stripeSession.PaymentStatus, "paid", StringComparison.OrdinalIgnoreCase);
                if (isPaid)
                {
                    payment.PaidAt ??= now;
                    order.Status = "paid";
                    order.IsPaid = true;
                    order.UpdatedAt = now;
                }
                else
                {
                    var hasAnyPaidPayment = await db.Payments.AnyAsync(
                        p => p.OrderId == order.Id
                            && p.Id != payment.Id
                            && p.Status == "paid",
                        cancellationToken);

                    var isFailedLikeState = string.Equals(stripeSession.Status, "expired", StringComparison.OrdinalIgnoreCase)
                        || string.Equals(stripeSession.PaymentStatus, "no_payment_required", StringComparison.OrdinalIgnoreCase);

                    if (!hasAnyPaidPayment && isFailedLikeState && string.Equals(order.Status, "pending_payment", StringComparison.OrdinalIgnoreCase))
                    {
                        order.Status = string.Equals(order.OrderType, "quote", StringComparison.OrdinalIgnoreCase)
                            ? "quoted"
                            : "failed";
                        order.IsPaid = false;
                        order.UpdatedAt = now;

                        if (string.Equals(order.OrderType, "quote", StringComparison.OrdinalIgnoreCase))
                            QuoteLifecycle.ApplyQuoteExpiration(order, now);
                    }
                }

                if (!string.Equals(previousOrderStatus, order.Status, StringComparison.OrdinalIgnoreCase))
                {
                    var note = isPaid
                        ? $"Payment marked as paid ({payment.Reference}) via stripe pending reconciler"
                        : $"Payment updated as {payment.Status} ({payment.Reference}) via stripe pending reconciler";

                    db.OrderStatusHistory.Add(new OrderStatusHistory
                    {
                        OrderId = order.Id,
                        PreviousStatus = previousOrderStatus,
                        NewStatus = order.Status,
                        ChangedAt = now,
                        ChangedBy = "stripe_reconciler",
                        Note = note
                    });
                }

                if (!wasAlreadyPaid && isPaid)
                    paidOrderIds.Add(order.Id);
            }

            await db.SaveChangesAsync(cancellationToken);

            if (paidOrderIds.Count == 0)
                return;

            foreach (var orderId in paidOrderIds.Distinct())
            {
                var paidPayment = await db.Payments
                    .Include(p => p.Order)
                    .ThenInclude(o => o!.Items)
                    .Where(p => p.OrderId == orderId)
                    .OrderByDescending(p => p.PaidAt ?? p.UpdatedAt)
                    .FirstOrDefaultAsync(cancellationToken);

                var order = paidPayment?.Order;
                if (order == null)
                    continue;

                var user = order.UserId.HasValue
                    ? await db.Users.FindAsync(new object[] { order.UserId.Value }, cancellationToken)
                    : null;

                var paidAmount = paidPayment!.Amount > 0
                    ? paidPayment.Amount
                    : order.QuotedPrice
                        ?? order.Items.Sum(i => (decimal)i.Price * (i.Count <= 0 ? 1 : i.Count)) + order.DeliveryPrice;

                try
                {
                    if (user != null)
                    {
                        await emailService.SendOrderPaidEmailAsync(user.Email, user.Name, order.Id, paidAmount);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed sending order paid email in reconciler for order {OrderId}", order.Id);
                }

                try
                {
                    await discordWebhookService.SendPaymentReceivedAsync(order, user, paidAmount);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed sending payment received Discord in reconciler for order {OrderId}", order.Id);
                }
            }
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // Graceful shutdown.
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Stripe pending payment reconciliation failed.");
        }
    }

    private static string NormalizeStripeStatus(string? sessionStatus, string? paymentStatus)
    {
        if (string.Equals(paymentStatus, "paid", StringComparison.OrdinalIgnoreCase))
            return "paid";

        if (string.Equals(paymentStatus, "unpaid", StringComparison.OrdinalIgnoreCase)
            && string.Equals(sessionStatus, "open", StringComparison.OrdinalIgnoreCase))
            return "open";

        if (string.Equals(paymentStatus, "no_payment_required", StringComparison.OrdinalIgnoreCase))
            return "canceled";

        if (string.Equals(sessionStatus, "expired", StringComparison.OrdinalIgnoreCase))
            return "expired";

        if (string.Equals(sessionStatus, "complete", StringComparison.OrdinalIgnoreCase))
            return "pending";

        return string.IsNullOrWhiteSpace(paymentStatus)
            ? string.IsNullOrWhiteSpace(sessionStatus)
                ? "unknown"
                : sessionStatus.ToLowerInvariant()
            : paymentStatus.ToLowerInvariant();
    }
}
