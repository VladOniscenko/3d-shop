using System.Net;
using System.Text;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
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
    Task SendQuoteConfirmationBankTransferEmailAsync(string toEmail, string toName, Guid orderId, decimal price, string? quoteMessage, string paymentReference);
    Task SendOrderSentTrackingEmailAsync(string toEmail, string toName, Guid orderId, string trackingCode, string? trackingUrl);
    Task SendOrderPaidEmailAsync(string toEmail, string toName, Guid orderId, decimal amount);
    Task SendCustomEmailAsync(string toEmail, string toName, string subject, string body);
}

public sealed class GmailSmtpEmailService : IEmailService
{
    private readonly EmailOptions _options;
    private readonly string _currencyCode;
    private readonly string _bankTransferAccountName;
    private readonly string _bankTransferIban;
    private readonly string? _bankTransferBic;

    public GmailSmtpEmailService(
        IOptions<EmailOptions> options,
        IConfiguration configuration)
    {
        _options = options.Value;
        _currencyCode = NormalizeCurrencyCode(configuration["CurrencyCode"]);
        _bankTransferAccountName = configuration["BankTransfer:AccountName"] ?? string.Empty;
        _bankTransferIban = configuration["BankTransfer:Iban"] ?? string.Empty;
        _bankTransferBic = configuration["BankTransfer:Bic"];
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
        var subject = "We received your quote request";
        var body = $"""
            Hi {WebUtility.HtmlEncode(toName)},

            We got your quote request (Order: {orderId}). 

            Our team will review your files and send pricing soon. You can check the status of your request anytime in your portal.

            - PrintCraft
            """;

        return SendTextEmailAsync(toEmail, subject, body);
    }

    public Task SendQuoteConfirmationEmailAsync(string toEmail, string toName, Guid orderId, decimal price, string? quoteMessage)
    {
        var subject = "Your quote is ready";
        var body = $"""
            Hi {WebUtility.HtmlEncode(toName)},

            Good news! Your quote for order {orderId} is ready.

            Please log in to your PrintCraft portal to view the price, read any notes from our team, and securely complete your payment.

            - PrintCraft
            """;

        return SendTextEmailAsync(toEmail, subject, body);
    }

    public Task SendQuoteConfirmationBankTransferEmailAsync(string toEmail, string toName, Guid orderId, decimal price, string? quoteMessage, string paymentReference)
    {
        var subject = "Your quote is ready for review";
        var body = $"""
            Hi {WebUtility.HtmlEncode(toName)},

            Good news! Your quote for order {orderId} is ready.

            Please log in to your PrintCraft portal to review the quote and get the bank transfer instructions to complete your payment.

            Once your transfer is received, we will start production.

            - PrintCraft
            """;

        return SendTextEmailAsync(toEmail, subject, body);
    }

    public Task SendOrderSentTrackingEmailAsync(string toEmail, string toName, Guid orderId, string trackingCode, string? trackingUrl)
    {
        var subject = "Your order has shipped";
        var body = $"""
            Hi {WebUtility.HtmlEncode(toName)},

            Your order ({orderId}) has been shipped!

            Please log in to your PrintCraft portal to view your tracking number and shipping details.

            Thanks for choosing PrintCraft.

            - PrintCraft
            """;

        return SendTextEmailAsync(toEmail, subject, body);
    }

    public Task SendOrderPaidEmailAsync(string toEmail, string toName, Guid orderId, decimal amount)
    {
        var subject = "Payment received";
        var body = $"""
            Hi {WebUtility.HtmlEncode(toName)},

            We successfully received your payment for order {orderId}.

            Your order is now confirmed and moving into production. You can track its progress at any time in your portal.

            - PrintCraft
            """;

        return SendTextEmailAsync(toEmail, subject, body);
    }

    public Task SendCustomEmailAsync(string toEmail, string toName, string subject, string body)
    {
        var safeSubject = string.IsNullOrWhiteSpace(subject)
            ? "PrintCraft"
            : subject.Trim();

        var safeBody = string.IsNullOrWhiteSpace(body)
            ? ""
            : body.Trim();

        return SendTextEmailAsync(toEmail, safeSubject, safeBody);
    }

    private async Task SendTextEmailAsync(string toEmail, string subject, string body)
    {
        if (!string.IsNullOrWhiteSpace(_options.SmtpHost))
        {
            await SendViaSmtpAsync(toEmail, subject, body);
            return;
        }

        throw new InvalidOperationException("SMTP email is not configured. Missing Email:SmtpHost.");
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

        smtpUser = smtpUser.Trim();
        smtpPassword = new string(smtpPassword.Where(c => !char.IsWhiteSpace(c)).ToArray());

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_options.SenderName, _options.SenderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new TextPart("plain")
        {
            Text = body
        };

        using var client = new MailKit.Net.Smtp.SmtpClient();
        client.ServerCertificateValidationCallback = (_, _, _, _) => true;
        client.AuthenticationMechanisms.Remove("XOAUTH2");

        var secureSocketOptions = _options.SmtpPort == 465
            ? SecureSocketOptions.SslOnConnect
            : _options.EnableSsl
                ? SecureSocketOptions.StartTls
                : SecureSocketOptions.None;

        await client.ConnectAsync(_options.SmtpHost, _options.SmtpPort, secureSocketOptions);
        await client.AuthenticateAsync(smtpUser, smtpPassword);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    private static string NormalizeCurrencyCode(string? currencyCode)
    {
        var normalized = (currencyCode ?? "EUR").Trim().ToUpperInvariant();
        return normalized.Length == 3 ? normalized : "EUR";
    }
}