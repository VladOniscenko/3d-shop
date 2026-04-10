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
    private readonly SemaphoreSlim _runLock = new(1, 1);

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

        await RunOnceAsync(stoppingToken);

        using var timer = new PeriodicTimer(PollInterval);
        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            await RunOnceAsync(stoppingToken);
        }

        _logger.LogInformation("Stripe pending payment reconciler stopped.");
    }

    public async Task<bool> RunOnceAsync(CancellationToken cancellationToken = default)
    {
        return await RunOnceInternalAsync(null, cancellationToken);
    }

    public async Task<bool> RunOnceForOrderAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        return await RunOnceInternalAsync(orderId, cancellationToken);
    }

    private async Task<bool> RunOnceInternalAsync(Guid? orderId, CancellationToken cancellationToken)
    {
        var acquired = await _runLock.WaitAsync(0, cancellationToken);
        if (!acquired)
            return false;

        try
        {
            await ReconcilePendingPaymentsAsync(orderId, cancellationToken);
            return true;
        }
        finally
        {
            _runLock.Release();
        }
    }

    private async Task ReconcilePendingPaymentsAsync(Guid? orderId, CancellationToken cancellationToken)
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
            var paymentIntentService = new PaymentIntentService();

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<PrintCraftDb>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
            var discordWebhookService = scope.ServiceProvider.GetRequiredService<IDiscordWebhookService>();

            var pendingPayments = await db.Payments
                .Include(p => p.Order)
                .ThenInclude(o => o!.Items)
                .Where(p => p.Provider == "stripe"
                    && (!orderId.HasValue || p.OrderId == orderId.Value)
                    && p.Order != null
                    && !p.Order.IsPaid
                    && p.ProviderPaymentId != null
                    && (p.Order.Status == "pending_payment"
                        || p.Status == "initializing"
                        || p.Status == "created"
                        || p.Status == "open"
                        || p.Status == "pending"
                        || p.Status == "unknown"))
                .OrderBy(p => p.CreatedAt)
                .Take(100)
                .ToListAsync(cancellationToken);

            _logger.LogInformation(
                "Stripe pending payment reconciler found {Count} candidate payments{Scope}.",
                pendingPayments.Count,
                orderId.HasValue ? $" for order {orderId.Value}" : string.Empty);

            if (pendingPayments.Count == 0)
                return;

            var now = DateTime.UtcNow;
            var paidOrderIds = new List<Guid>();
            var issueNotificationCandidates = new List<(Guid OrderId, Guid PaymentId)>();

            foreach (var payment in pendingPayments)
            {
                var order = payment.Order;
                if (order == null || string.IsNullOrWhiteSpace(payment.ProviderPaymentId))
                    continue;

                Session? stripeSession = null;
                PaymentIntent? stripePaymentIntent = null;

                if (payment.ProviderPaymentId.StartsWith("pi_", StringComparison.OrdinalIgnoreCase))
                {
                    try
                    {
                        stripePaymentIntent = await paymentIntentService.GetAsync(payment.ProviderPaymentId, cancellationToken: cancellationToken);
                    }
                    catch (StripeException ex)
                    {
                        _logger.LogWarning(ex, "Failed retrieving Stripe payment intent {PaymentIntentId} for order {OrderId}", payment.ProviderPaymentId, order.Id);
                        continue;
                    }
                }
                else
                {
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

                    if (!string.IsNullOrWhiteSpace(stripeSession.PaymentIntentId))
                    {
                        try
                        {
                            stripePaymentIntent = await paymentIntentService.GetAsync(stripeSession.PaymentIntentId, cancellationToken: cancellationToken);
                        }
                        catch (StripeException ex)
                        {
                            _logger.LogWarning(ex, "Failed retrieving Stripe payment intent {PaymentIntentId} linked to session {SessionId}", stripeSession.PaymentIntentId, stripeSession.Id);
                        }
                    }
                }

                if (stripePaymentIntent == null)
                {
                    try
                    {
                        var search = await paymentIntentService.SearchAsync(new PaymentIntentSearchOptions
                        {
                            Query = $"metadata['paymentId']:'{payment.Id}'",
                            Limit = 1,
                        }, cancellationToken: cancellationToken);

                        stripePaymentIntent = search.Data.FirstOrDefault();
                    }
                    catch (StripeException ex)
                    {
                        _logger.LogWarning(ex, "Failed searching Stripe payment intent by metadata paymentId {PaymentId} for order {OrderId}", payment.Id, order.Id);
                    }
                }

                var previousOrderStatus = order.Status;
                var wasAlreadyPaid = order.IsPaid;
                var previousPaymentStatus = payment.Status;

                payment.Method ??= stripeSession?.PaymentMethodTypes?.FirstOrDefault();
                payment.Status = stripeSession != null
                    ? NormalizeStripeStatus(stripeSession.Status, stripeSession.PaymentStatus, stripePaymentIntent?.Status)
                    : NormalizeStripeIntentStatus(stripePaymentIntent?.Status);
                if (!string.IsNullOrWhiteSpace(stripePaymentIntent?.LastPaymentError?.Message))
                    payment.FailureReason = TruncateFailureReason(stripePaymentIntent.LastPaymentError.Message);
                payment.UpdatedAt = now;

                var isPaid = stripeSession != null
                    ? string.Equals(stripeSession.PaymentStatus, "paid", StringComparison.OrdinalIgnoreCase)
                        || string.Equals(stripePaymentIntent?.Status, "succeeded", StringComparison.OrdinalIgnoreCase)
                    : string.Equals(stripePaymentIntent?.Status, "succeeded", StringComparison.OrdinalIgnoreCase);

                var isFailedLikeState = stripeSession != null
                    ? string.Equals(stripeSession.Status, "expired", StringComparison.OrdinalIgnoreCase)
                        || string.Equals(stripeSession.PaymentStatus, "no_payment_required", StringComparison.OrdinalIgnoreCase)
                        || (string.Equals(stripeSession.PaymentStatus, "unpaid", StringComparison.OrdinalIgnoreCase)
                            && IsFailedLikePaymentIntentStatus(stripePaymentIntent?.Status))
                    : IsFailedLikePaymentIntentStatus(stripePaymentIntent?.Status);

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

                    if (string.Equals(payment.Status, "expired", StringComparison.OrdinalIgnoreCase))
                        payment.ExpiredAt ??= now;
                    else if (string.Equals(payment.Status, "failed", StringComparison.OrdinalIgnoreCase)
                        || string.Equals(payment.Status, "canceled", StringComparison.OrdinalIgnoreCase))
                        payment.FailedAt ??= now;

                    if (!hasAnyPaidPayment
                        && isFailedLikeState
                        && !order.IsPaid
                        && !string.Equals(order.Status, "failed", StringComparison.OrdinalIgnoreCase)
                        && !string.Equals(order.Status, "completed", StringComparison.OrdinalIgnoreCase))
                    {
                        order.Status = "failed";
                        order.IsPaid = false;
                        order.UpdatedAt = now;
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

                if (!string.Equals(previousPaymentStatus, payment.Status, StringComparison.OrdinalIgnoreCase))
                {
                    db.OrderStatusHistory.Add(new OrderStatusHistory
                    {
                        OrderId = order.Id,
                        PreviousStatus = string.IsNullOrWhiteSpace(order.Status) ? "pending_payment" : order.Status,
                        NewStatus = string.IsNullOrWhiteSpace(order.Status) ? "pending_payment" : order.Status,
                        ChangedAt = now,
                        ChangedBy = "stripe_reconciler",
                        Note = $"Payment status changed {previousPaymentStatus} -> {payment.Status} ({payment.Reference}) via stripe pending reconciler"
                    });
                }

                if (PaymentStateBecameIssue(previousPaymentStatus, payment.Status))
                {
                    issueNotificationCandidates.Add((order.Id, payment.Id));
                }

                if (!wasAlreadyPaid && isPaid)
                    paidOrderIds.Add(order.Id);
            }

            await db.SaveChangesAsync(cancellationToken);

            if (paidOrderIds.Count == 0)
                return;

            foreach (var paidOrderId in paidOrderIds.Distinct())
            {
                var paidPayment = await db.Payments
                    .Include(p => p.Order)
                    .ThenInclude(o => o!.Items)
                    .Where(p => p.OrderId == paidOrderId)
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

            foreach (var issueCandidate in issueNotificationCandidates.Distinct())
            {
                var payment = await db.Payments
                    .Include(p => p.Order)
                    .ThenInclude(o => o!.Items)
                    .FirstOrDefaultAsync(p => p.Id == issueCandidate.PaymentId, cancellationToken);

                var order = payment?.Order;
                if (payment == null || order == null)
                    continue;

                var user = order.UserId.HasValue
                    ? await db.Users.FindAsync(new object[] { order.UserId.Value }, cancellationToken)
                    : null;

                var amount = payment.Amount > 0
                    ? payment.Amount
                    : order.QuotedPrice
                        ?? order.Items.Sum(i => (decimal)i.Price * (i.Count <= 0 ? 1 : i.Count)) + order.DeliveryPrice;

                try
                {
                    await discordWebhookService.SendPaymentIssueAsync(
                        order,
                        user,
                        amount,
                        payment.Status,
                        payment.Reference,
                        payment.FailureReason,
                        cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed sending payment issue Discord in reconciler for order {OrderId}", order.Id);
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

    private static string NormalizeStripeStatus(string? sessionStatus, string? paymentStatus, string? paymentIntentStatus)
    {
        if (string.Equals(paymentIntentStatus, "succeeded", StringComparison.OrdinalIgnoreCase))
            return "paid";

        if (string.Equals(paymentStatus, "paid", StringComparison.OrdinalIgnoreCase))
            return "paid";

        if (string.Equals(paymentStatus, "unpaid", StringComparison.OrdinalIgnoreCase)
            && IsFailedLikePaymentIntentStatus(paymentIntentStatus))
            return "failed";

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

    private static string NormalizeStripeIntentStatus(string? paymentIntentStatus)
    {
        if (string.IsNullOrWhiteSpace(paymentIntentStatus))
            return "unknown";

        if (string.Equals(paymentIntentStatus, "succeeded", StringComparison.OrdinalIgnoreCase))
            return "paid";

        if (string.Equals(paymentIntentStatus, "requires_payment_method", StringComparison.OrdinalIgnoreCase))
            return "failed";

        if (string.Equals(paymentIntentStatus, "canceled", StringComparison.OrdinalIgnoreCase))
            return "canceled";

        if (string.Equals(paymentIntentStatus, "processing", StringComparison.OrdinalIgnoreCase))
            return "pending";

        return "pending";
    }

    private static bool IsFailedLikePaymentIntentStatus(string? paymentIntentStatus)
        => string.Equals(paymentIntentStatus, "requires_payment_method", StringComparison.OrdinalIgnoreCase)
            || string.Equals(paymentIntentStatus, "canceled", StringComparison.OrdinalIgnoreCase);

    private static bool IsIssuePaymentStatus(string? status)
        => string.Equals(status, "failed", StringComparison.OrdinalIgnoreCase)
            || string.Equals(status, "canceled", StringComparison.OrdinalIgnoreCase)
            || string.Equals(status, "expired", StringComparison.OrdinalIgnoreCase)
            || string.Equals(status, "create_failed", StringComparison.OrdinalIgnoreCase);

    private static bool PaymentStateBecameIssue(string? previous, string? current)
        => !IsIssuePaymentStatus(previous) && IsIssuePaymentStatus(current);

    private static string TruncateFailureReason(string reason)
        => reason.Length > 256 ? reason[..256] : reason;
}
