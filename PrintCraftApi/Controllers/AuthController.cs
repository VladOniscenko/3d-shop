using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PrintCraftApi.Data;
using PrintCraftApi.Models;
using Microsoft.AspNetCore.Authorization;

namespace PrintCraftApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly PrintCraftDb _db;
    private readonly IConfiguration _configuration;

    public AuthController(PrintCraftDb db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var name = req.Name?.Trim();
        var email = req.Email?.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(name) || name.Length < 2 || name.Length > 80)
            return BadRequest(new { message = "Name must be between 2 and 80 characters." });

        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            return BadRequest(new { message = "A valid email is required." });

        if (string.IsNullOrWhiteSpace(req.Password) || req.Password.Length < 8)
            return BadRequest(new { message = "Password must be at least 8 characters." });

        if (await _db.Users.AnyAsync(u => u.Email == email))
            return BadRequest("Email already exists.");

        var user = new User
        {
            Name = name,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = "customer"
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return Ok(new { message = "User registered!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var normalizedEmail = req.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized();

        var secretKey = _configuration["JwtSecret"] ?? "YOUR_SUPER_SECRET_KEY_MAKE_IT_LONG_12345!";
        var key = Encoding.ASCII.GetBytes(secretKey);

        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return Ok(new
        {
            token = tokenHandler.WriteToken(token),
            user = new { user.Id, user.Name, user.Email, user.Role }
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var user = await _db.Users.FindAsync(Guid.Parse(userId));
        return user != null
            ? Ok(new { user.Id, user.Name, user.Email, user.Role })
            : NotFound();
    }
}

public record RegisterRequest(string Name, string Email, string Password);
public record LoginRequest(string Email, string Password);
