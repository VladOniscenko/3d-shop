using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using PrintCraftApi.Models;

namespace PrintCraftApi.Routes;

public static class AuthRoutes
{
    public static void MapAuthRoutes(this IEndpointRouteBuilder app, string secretKey)
    {
        var group = app.MapGroup("/api/auth");
        var key = Encoding.ASCII.GetBytes(secretKey);

        // REGISTER
        group.MapPost("/register", async (User user, PrintCraftDb db) =>
        {
            if (await db.Users.AnyAsync(u => u.Email == user.Email))
                return Results.BadRequest("Email already exists.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            db.Users.Add(user);
            await db.SaveChangesAsync();
            return Results.Ok(new { message = "User registered!" });
        });

        // LOGIN
        group.MapPost("/login", async (LoginRequest req, PrintCraftDb db) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Results.Unauthorized();

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
            return Results.Ok(new
            {
                token = tokenHandler.WriteToken(token),
                user = new { user.Id, user.Name, user.Email, user.Role }
            });
        });

        // ME
        group.MapGet("/me", async (ClaimsPrincipal user, PrintCraftDb db) =>
        {
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Results.Unauthorized();

            var userData = await db.Users.FindAsync(Guid.Parse(userId));
            return userData != null ? Results.Ok(userData) : Results.NotFound();
        }).RequireAuthorization();
    }
}

public record LoginRequest(string Email, string Password);