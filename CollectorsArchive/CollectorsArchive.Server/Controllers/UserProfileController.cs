using CollectorsArchive.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CollectorsArchive.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserProfileController : ControllerBase
    {
        private readonly AppDatabaseContents _db;

        public UserProfileController(AppDatabaseContents db)
        {
            _db = db;
        }

        // GET api/UserProfile/{userId}
        // Returns the profile for a given user, including username from User table
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetProfile(int userId)
        {
            var user = await _db.UserInformation
                .FirstOrDefaultAsync(u => u.UserProfileId == userId);

            if (user == null)
                return NotFound(new { message = "Profile not found." });

            return Ok(new
            {
                userId = user.UserProfileId,
                userName = user.UserName,
                bio = user.Bio,
                photoUrl = user.PhotoUrl,
                joinDate = user.JoinDate,
            });
        }

        // PUT api/UserProfile/{userId}
        // Updates bio, photoUrl, and/or username for a given user
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateProfile(int userId, [FromBody] UpdateProfileRequest request)
        {
            var user = await _db.UserInformation
                .FirstOrDefaultAsync(u => u.UserProfileId == userId);

            if (user == null)
                return NotFound(new { message = "Profile not found." });

            // Update bio and photo on the UserProfile table
            if (request.Bio != null)
                user.Bio = request.Bio;

            if (request.PhotoUrl != null)
                user.PhotoUrl = request.PhotoUrl;

            // Update username on the User table
            if (request.UserName != null)
                user.UserName = request.UserName;

            await _db.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully." });
        }
    }

    public class UpdateProfileRequest//THIS NEEDS CHANGE
    {
        public string? Bio { get; set; }
        public string? PhotoUrl { get; set; }
        public string? UserName { get; set; }
    }
}