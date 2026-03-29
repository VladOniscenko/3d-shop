using System.Text;
using System.Text.Json;
using PrintCraftApi.Models;

namespace PrintCraftApi.Services;

public interface IDiscordWebhookService
{
    Task SendUnhandledExceptionAsync(HttpContext context, Exception exception, CancellationToken cancellationToken = default);
    Task SendQuoteRequestedAsync(Order order, User user, CancellationToken cancellationToken = default);
    Task SendBookingCreatedAsync(Order order, User? user, CancellationToken cancellationToken = default);
    Task SendPaymentReceivedAsync(Order order, User? user, decimal paidAmount, CancellationToken cancellationToken = default);
}

public sealed class DiscordWebhookService : IDiscordWebhookService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<DiscordWebhookService> _logger;

    public DiscordWebhookService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<DiscordWebhookService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public Task SendUnhandledExceptionAsync(HttpContext context, Exception exception, CancellationToken cancellationToken = default)
    {
        var webhookUrl = _configuration["Discord__WebhookUrl"];
        if (string.IsNullOrWhiteSpace(webhookUrl)) return Task.CompletedTask;

        var userId = context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "anonymous";
        var message = $"Unhandled exception in PrintCraft API\n" +
            $"Method: {context.Request.Method}\n" +
            $"Path: {context.Request.Path}\n" +
            $"UserId: {userId}\n" +
            $"TraceId: {context.TraceIdentifier}\n" +
            $"Exception: {exception.GetType().Name}\n" +
            $"Message: {exception.Message}\n" +
            $"Stack: {exception.StackTrace}";

        return PostToWebhookAsync(webhookUrl, message, "global exception", cancellationToken);
    }

    public Task SendQuoteRequestedAsync(Order order, User user, CancellationToken cancellationToken = default)
    {
        var webhookUrl = _configuration["Discord__QuoteWebhookUrl"];
        if (string.IsNullOrWhiteSpace(webhookUrl)) return Task.CompletedTask;

        var message = $"🧾 New quote request\n" +
            $"orderId: {order.Id}\n" +
            $"createdAt: {order.CreatedAt:O}\n" +
            $"status: {order.Status}\n" +
            $"type: {order.OrderType}\n" +
            $"userId: {user.Id}\n" +
            $"name: {user.Name}\n" +
            $"email: {user.Email}\n" +
            $"itemCount: {order.Items.Count}\n" +
            $"items:\n{BuildItemLines(order.Items)}";

        return PostToWebhookAsync(webhookUrl, message, "quote notification", cancellationToken);
    }

    public Task SendBookingCreatedAsync(Order order, User? user, CancellationToken cancellationToken = default)
    {
        var webhookUrl = _configuration["Discord__BookingWebhookUrl"];
        if (string.IsNullOrWhiteSpace(webhookUrl)) return Task.CompletedTask;

        var userName = user?.Name ?? order.FullName;
        var userEmail = user?.Email ?? "unknown";

        var message = $"📦 New booking created\n" +
            $"orderId: {order.Id}\n" +
            $"createdAt: {order.CreatedAt:O}\n" +
            $"status: {order.Status}\n" +
            $"type: {order.OrderType}\n" +
            $"userId: {(order.UserId?.ToString() ?? "unknown")}\n" +
            $"name: {userName}\n" +
            $"email: {userEmail}\n" +
            $"phone: {order.PhoneNumber}\n" +
            $"address: {order.AddressLine1}, {order.City}, {order.PostalCode}\n" +
            $"deliveryPrice: {order.DeliveryPrice:F2}\n" +
            $"subtotal: {order.SubtotalAmount:F2}\n" +
            $"itemCount: {order.Items.Count}\n" +
            $"items:\n{BuildItemLines(order.Items)}";

        return PostToWebhookAsync(webhookUrl, message, "booking notification", cancellationToken);
    }

    public Task SendPaymentReceivedAsync(Order order, User? user, decimal paidAmount, CancellationToken cancellationToken = default)
    {
        var webhookUrl = _configuration["Discord__PaymentReceivedWebhookUrl"];
        if (string.IsNullOrWhiteSpace(webhookUrl)) return Task.CompletedTask;

        var userName = user?.Name ?? order.FullName;
        var userEmail = user?.Email ?? "unknown";

        var message = "✅ Payment received\n" +
            $"orderId: {order.Id}\n" +
            $"paidAt: {DateTime.UtcNow:O}\n" +
            $"status: {order.Status}\n" +
            $"type: {order.OrderType}\n" +
            $"userId: {(order.UserId?.ToString() ?? "unknown")}\n" +
            $"name: {userName}\n" +
            $"email: {userEmail}\n" +
            $"amountPaid: {paidAmount:F2}\n" +
            $"deliveryPrice: {order.DeliveryPrice:F2}\n" +
            $"itemCount: {order.Items.Count}\n" +
            $"items:\n{BuildItemLines(order.Items)}";

        return PostToWebhookAsync(webhookUrl, message, "payment received notification", cancellationToken);
    }

    private async Task PostToWebhookAsync(string webhookUrl, string content, string logContext, CancellationToken cancellationToken)
    {
        try
        {
            var payload = new { content = TruncateForDiscord(content, 1900) };
            using var request = new HttpRequestMessage(HttpMethod.Post, webhookUrl)
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
            };

            var client = _httpClientFactory.CreateClient();
            using var response = await client.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("Discord {Context} failed. Status: {StatusCode}. Body: {Body}", logContext, (int)response.StatusCode, body);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed sending Discord {Context}.", logContext);
        }
    }

    private static string BuildItemLines(IEnumerable<OrderItem> items)
    {
        return string.Join("\n", items.Select((item, index) =>
        {
            var model = !string.IsNullOrWhiteSpace(item.fileName)
                ? item.fileName
                : (!string.IsNullOrWhiteSpace(item.FileUrl) ? "uploaded_file" : "text_description");
            var notes = string.IsNullOrWhiteSpace(item.Notes) ? "-" : item.Notes.Trim();
            return $"{index + 1}. model={model}, material={item.Material}, color={item.Color}, qty={Math.Max(item.Count, 1)}, notes={notes}";
        }));
    }

    private static string TruncateForDiscord(string input, int maxLen)
    {
        if (string.IsNullOrEmpty(input) || input.Length <= maxLen) return input;
        return input[..(maxLen - 3)] + "...";
    }
}
