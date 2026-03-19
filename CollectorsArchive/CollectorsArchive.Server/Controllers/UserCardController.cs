using CollectorsArchive.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CollectorsArchive.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserCardController : ControllerBase
    {
        private readonly AppDatabaseContents _db;

        public UserCardController(AppDatabaseContents db)
        {
            _db = db;
        }

        [HttpPost("AddToCollection")]
        public async Task<IActionResult> AddToCollection([FromBody] AddToCollectionRequest request)
        {
            //if (request.UserId == 0 || string.IsNullOrWhiteSpace(request.PrintID))
            //    return BadRequest(new { message = "UserID and PrintID are required." });

            // check if this print already exists in their collection
            var existing = await _db.UserCards
                .FirstOrDefaultAsync(c => c.UserID == request.UserId && c.PrintID == request.PrintID);

            if (existing != null)
            {
                // already have it, just bump the quantity
                existing.Quantity =+ request.Quantity;
                await _db.SaveChangesAsync();
                return Ok(new { message = "Quantity updated.", quantity = existing.Quantity });
            }

            // first time adding this print
            var newCard = new UserCard
            {
                UserID = request.UserId,
                PrintID = request.PrintID,
                Quantity = request.Quantity
            };

            _db.UserCards.Add(newCard);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Card added to collection.", quantity = newCard.Quantity });
        }
    }

    public class AddToCollectionRequest
    {
        public int UserId { get; set; }
        public int PrintID { get; set; }
        public int Quantity { get; set; } = 1;
    }
}