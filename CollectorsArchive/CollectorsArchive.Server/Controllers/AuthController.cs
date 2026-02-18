using CollectorsArchive.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CollectorsArchive.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDatabaseContents _db;

        public AuthController(AppDatabaseContents db)
        {
            _db = db;
        }

        /// <summary>
        /// Registers a new user via Google authentication.
        /// Receives the user's email, name, and Google subject ID.
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] GoogleAuthRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.GoogleSubject))
            {
                return BadRequest(new { message = "Email, Name, and Google Subject are required." });
            }

            // Check if user already exists by Google Subject or Email
            var existingUser = await _db.UserInformation
                .FirstOrDefaultAsync(u => u.GoogleSubject == request.GoogleSubject || u.Email == request.Email);

            if (existingUser != null)
            {
                return Conflict(new { message = "A user with this email or Google account already exists." });
            }

            var newUser = new UserInformation
            {
                Email = request.Email,
                UserName = request.Name,
                GoogleSubject = request.GoogleSubject
            };
            //Adding new user to the database
            _db.UserInformation.Add(newUser);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Registration successful.",
                userId = newUser.UserId,
                email = newUser.Email,
                userName = newUser.UserName
            });
        }

        /// <summary>
        /// Logs in a user via Google authentication.
        /// Looks up the user by their Google subject ID.
        /// </summary>
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.GoogleSubject))
            {
                return BadRequest(new { message = "Google Subject is required." });
            }

            var user = await _db.UserInformation
                .FirstOrDefaultAsync(u => u.GoogleSubject == request.GoogleSubject);

            if (user == null)
            {
                return NotFound(new { message = "User not found. Please register first." });
            }

            return Ok(new
            {
                message = "Login successful.",
                userId = user.UserId,
                email = user.Email,
                userName = user.UserName
            });
        }
    }

    /// <summary>
    /// Request model for Google authentication endpoints.
    /// </summary>
    public class GoogleAuthRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string GoogleSubject { get; set; } = string.Empty;
    }
}