using System.Net;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace PrintCraftApi.Services;

public sealed class EmailOptions
{
    public string SenderName { get; set; } = "PrintCraft";
    public string SenderEmail { get; set; } = "noreply@printcraft.local";
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool EnableSsl { get; set; } = true;
    public string ApiBaseUrl { get; set; } = "https://send.api.mailtrap.io/api/send";
    public string ApiToken { get; set; } = string.Empty;
    public string Category { get; set; } = "PrintCraft";
}

public interface IEmailService
{
    Task SendResetPasswordEmailAsync(string toEmail, string toName, string resetLink);
    Task SendQuoteRequestedEmailAsync(string toEmail, string toName, Guid orderId);
    Task SendQuoteConfirmationEmailAsync(string toEmail, string toName, Guid orderId, decimal price, string? quoteMessage);
    Task SendOrderSentTrackingEmailAsync(string toEmail, string toName, Guid orderId, string trackingCode, string? trackingUrl);
}

public sealed class MailtrapEmailService : IEmailService
{
    private readonly EmailOptions _options;
    private readonly HttpClient _httpClient;
    private readonly ILogger<MailtrapEmailService> _logger;

    public MailtrapEmailService(
        HttpClient httpClient,
        IOptions<EmailOptions> options,
        ILogger<MailtrapEmailService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public Task SendResetPasswordEmailAsync(string toEmail, string toName, string resetLink)
    {
        var subject = "Reset your PrintCraft password";
        var body = $"""
            Hi {WebUtility.HtmlEncode(toName)},

            We received a request to reset your password.

            Reset link:
            {resetLink}

            If you did not request this, you can ignore this email.

            - PrintCraft
            """;

        return SendTextEmailAsync(toEmail, subject, body);
    }

    public Task SendQuoteRequestedEmailAsync(string toEmail, string toName, Guid orderId)
    {
        var subject = "Quote request received";
        var body = $"""
            Hi {WebUtility.HtmlEncode(toName)},

            We received your quote request.
            Reference: {orderId}

            Our team will review your files and send pricing soon.

            - PrintCraft
            """;

        return SendTextEmailAsync(toEmail, subject, body);
    }

    public Task SendQuoteConfirmationEmailAsync(string toEmail, string toName, Guid orderId, decimal price, string? quoteMessage)
    {
        var safeMessage = string.IsNullOrWhiteSpace(quoteMessage)
            ? "No extra notes."
            : quoteMessage.Trim();

        var subject = "Your quote is ready";
        var body = $"""
            Hi {WebUtility.HtmlEncode(toName)},

            Your quote is ready.
            Reference: {orderId}
            Total quote: EUR {price:F2}

            Message from our team:
            {safeMessage}

            Please reply if you have any questions.

            - PrintCraft
            """;

        return SendTextEmailAsync(toEmail, subject, body);
    }

    public Task SendOrderSentTrackingEmailAsync(string toEmail, string toName, Guid orderId, string trackingCode, string? trackingUrl)
    {
        var safeTrackingUrl = string.IsNullOrWhiteSpace(trackingUrl)
            ? "Not provided"
            : trackingUrl.Trim();

        var subject = "Your order has been sent";
        var body = $"""
            Hi {WebUtility.HtmlEncode(toName)},

            Your order has been shipped.
            Reference: {orderId}
            Tracking code: {trackingCode}
            Tracking link: {safeTrackingUrl}

            Thanks for choosing PrintCraft.

            - PrintCraft
            """;

        return SendTextEmailAsync(toEmail, subject, body);
    }

    private async Task SendTextEmailAsync(string toEmail, string subject, string body)
    {
        if (!string.IsNullOrWhiteSpace(_options.SmtpHost))
        {
            await SendViaSmtpAsync(toEmail, subject, body);
            return;
        }

        await SendViaApiAsync(toEmail, subject, body);
    }

    private async Task SendViaApiAsync(string toEmail, string subject, string body)
    {
        var apiToken = string.IsNullOrWhiteSpace(_options.ApiToken)
            ? Environment.GetEnvironmentVariable("MAILTRAP_API_TOKEN")
            : _options.ApiToken;

        if (string.IsNullOrWhiteSpace(apiToken))
        {
            throw new InvalidOperationException("Email service is not configured. Missing Mailtrap API token.");
        }

        var payload = new
        {
            from = new
            {
                email = _options.SenderEmail,
                name = _options.SenderName,
            },
            to = new[]
            {
                new { email = toEmail }
            },
            subject,
            text = body,
            category = _options.Category,
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, _options.ApiBaseUrl)
        {
            Content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiToken);

        using var response = await _httpClient.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError(
                "Mailtrap send failed. Status: {StatusCode}. Body: {Body}",
                (int)response.StatusCode,
                responseBody);
            throw new InvalidOperationException("Failed to send email via Mailtrap.");
        }

        _logger.LogInformation("Email sent via Mailtrap API. Subject: {Subject}, To: {To}", subject, toEmail);
    }

    private async Task SendViaSmtpAsync(string toEmail, string subject, string body)
    {
        var smtpUser = string.IsNullOrWhiteSpace(_options.Username)
            ? Environment.GetEnvironmentVariable("Email__Username")
            : _options.Username;
        var smtpPassword = string.IsNullOrWhiteSpace(_options.Password)
            ? Environment.GetEnvironmentVariable("Email__Password")
            : _options.Password;

        if (string.IsNullOrWhiteSpace(smtpUser) || string.IsNullOrWhiteSpace(smtpPassword))
        {
            throw new InvalidOperationException("SMTP email is not configured. Missing Email:Username or Email:Password.");
        }

        using var message = new MailMessage
        {
            From = new MailAddress(_options.SenderEmail, _options.SenderName),
            Subject = subject,
            Body = body,
            IsBodyHtml = false,
        };
        message.To.Add(toEmail);

        using var client = new SmtpClient(_options.SmtpHost, _options.SmtpPort)
        {
            EnableSsl = _options.EnableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false,
            Credentials = new NetworkCredential(smtpUser, smtpPassword),
        };

        await client.SendMailAsync(message);
        _logger.LogInformation("Email sent via SMTP. Subject: {Subject}, To: {To}", subject, toEmail);
    }
}
