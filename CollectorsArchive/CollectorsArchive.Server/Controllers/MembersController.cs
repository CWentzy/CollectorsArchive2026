using CollectorsArchive.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CollectorsArchive.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MembersController : ControllerBase
    {
        private readonly AppDatabaseContents _db;

        public MembersController(AppDatabaseContents db)
        {
            _db = db;
        }
        // Returns all registered members with their profile data (photo + join date).
        // Profile may be null if the user has not set up their profile yet.
        [HttpGet("GetAllMembers")]
        public async Task<IActionResult> GetAllMembers()
        {
            var members = await _db.UserProfile
                .Select(u => new
                {
                    userId = u.UserId,
                    userName = u.UserName,
                    photoUrl = u.PhotoUrl,
                    joinDate = u.JoinDate
                })
                .ToListAsync();

            return Ok(members);
        }
    }
}