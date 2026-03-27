using System.Net;
using System.Net.Mail;
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
}

public interface IEmailService
{
    Task SendResetPasswordEmailAsync(string toEmail, string toName, string resetLink);
    Task SendQuoteRequestedEmailAsync(string toEmail, string toName, Guid orderId);
    Task SendQuoteConfirmationEmailAsync(string toEmail, string toName, Guid orderId, decimal price, string? quoteMessage);
    Task SendOrderSentTrackingEmailAsync(string toEmail, string toName, Guid orderId, string trackingCode, string? trackingUrl);
}

public sealed class SmtpEmailService : IEmailService
{
    private readonly EmailOptions _options;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IOptions<EmailOptions> options, ILogger<SmtpEmailService> logger)
    {
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
        if (string.IsNullOrWhiteSpace(_options.SmtpHost))
        {
            throw new InvalidOperationException("Email service is not configured. Missing Email:SmtpHost.");
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
            Credentials = new NetworkCredential(_options.Username, _options.Password),
        };

        await client.SendMailAsync(message);
        _logger.LogInformation("Email sent. Subject: {Subject}, To: {To}", subject, toEmail);
    }
}
