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
            var profile = await _db.UserProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Profile not found." });

            return Ok(new
            {
                profileId = profile.ProfileId,
                userId = profile.UserId,
                userName = profile.User?.UserName,
                bio = profile.Bio,
                photoUrl = profile.PhotoUrl,
                joinDate = profile.JoinDate,
            });
        }

        // PUT api/UserProfile/{userId}
        // Updates bio, photoUrl, and/or username for a given user
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateProfile(int userId, [FromBody] UpdateProfileRequest request)
        {
            var profile = await _db.UserProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Profile not found." });

            // Update bio and photo on the UserProfile table
            if (request.Bio != null)
                profile.Bio = request.Bio;

            if (request.PhotoUrl != null)
                profile.PhotoUrl = request.PhotoUrl;

            // Update username on the User table
            if (request.UserName != null && profile.User != null)
                profile.User.UserName = request.UserName;

            await _db.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully." });
        }
    }

    public class UpdateProfileRequest
    {
        public string? Bio { get; set; }
        public string? PhotoUrl { get; set; }
        public string? UserName { get; set; }
    }
}