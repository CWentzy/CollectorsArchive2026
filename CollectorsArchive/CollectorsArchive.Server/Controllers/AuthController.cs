using CollectorsArchive.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;

namespace CollectorsArchive.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(AppDatabaseContents db, IHttpClientFactory httpClientFactory, IConfiguration configuration) : ControllerBase
    {
        private readonly AppDatabaseContents db = db;
        private readonly IHttpClientFactory httpClientFactory = httpClientFactory;
        private readonly IConfiguration configuration = configuration;

        /// <summary>
        /// Accepts a Google OAuth2 access token, verifies it server-side with Google,
        /// upserts the user in the database, and returns a signed JWT for future requests.
        /// </summary>
        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.AccessToken))
            {
                return BadRequest(new { message = "Access token is required." });
            }

            // Verify the access token with Google and retrieve user info
            using var client = httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", request.AccessToken);

            var googleResponse = await client.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo");
            if (!googleResponse.IsSuccessStatusCode)
            {
                return Unauthorized(new { message = "Invalid or expired Google access token." });
            }

            var googleUser = await googleResponse.Content.ReadFromJsonAsync<GoogleUserInfo>();
            if (googleUser?.Sub == null || googleUser?.Email == null)
            {
                return Unauthorized(new { message = "Could not retrieve user info from Google." });
            }

            // Upsert: find by Google Subject or email, otherwise create one if new
            var user = await db.UserInformation.FirstOrDefaultAsync(u => u.GoogleSubject == googleUser.Sub || u.Email == googleUser.Email);

            if (user == null)
            {
                user = new UserInformation
                {
                    Email = googleUser.Email,
                    UserName = googleUser.Name ?? googleUser.Email.Split('@')[0], // Fallback to email prefix if name is not available
                    GoogleSubject = googleUser.Sub,
                };

                db.UserInformation.Add(user);
                await db.SaveChangesAsync();
            }
            else if (user.GoogleSubject != googleUser.Sub)
            {
                // Set GoogleSubject if the user was found by email but has no subject
                user.GoogleSubject = googleUser.Sub;
                await db.SaveChangesAsync();
            }

            // Generate a JWT for the user
            var token = GenerateJwt(user);

            return Ok(new
            {
                token,
                email = user.Email,
                userName = user.UserName,
                pictureUrl = googleUser.Picture,
            });
        }

        private string GenerateJwt(UserInformation user)
        {
            var jwtSection = configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Secret"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiryMinutes = double.Parse(jwtSection["ExpiryMinutes"] ?? "1440");

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("userName", user.UserName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var token = new JwtSecurityToken(
                issuer: jwtSection["Issuer"],
                audience: jwtSection["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class GoogleLoginRequest
    {
        public string AccessToken { get; set; } = string.Empty;
    }

    /// <summary>Google's /oauth2/v3/userinfo response shape.</summary>
    public class GoogleUserInfo
    {
        [JsonPropertyName("sub")]
        public string Sub { get; set; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("picture")]
        public string? Picture { get; set; }
    }
}