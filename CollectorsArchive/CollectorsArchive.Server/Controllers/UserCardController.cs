using CollectorsArchive.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace CollectorsArchive.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserCardController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        public UserCardController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        
        // CHANGED IT TO USE THE STORED PROCEDURE INSTEAD OF EF CORE FOR BETTER PERFORMANCE AND TO AVOID CONCURRENCY ISSUES
        [HttpPost("IncrementDecrementFromCollection")]
        public async Task<IActionResult> IncrementDecrementFromCollection(
        [FromBody] IncrementDecrementFromCollectionRequest request)
        {
            try
            {
                if (request.UserProfileId <= 0 || request.PrintID <= 0)
                    return BadRequest(new { message = "Valid UserProfileId and PrintID are required." });

                string connectionString = _configuration.GetConnectionString("ErmiyasDb");

                int quantity = 0;

                using (SqlConnection conn = new SqlConnection(connectionString))
                using (SqlCommand command = new SqlCommand("IncrementDecrementFromCollection", conn))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue("@UserProfileID", request.UserProfileId);
                    command.Parameters.AddWithValue("@PrintID", request.PrintID);
                    command.Parameters.AddWithValue("@Increment", request.Increment);

                    await conn.OpenAsync();


                    var result = await command.ExecuteScalarAsync(); //Using Scalar here now

                    if (result != null)
                    {
                        quantity = Convert.ToInt32(result);
                    }
                }

                return Ok(new { quantity });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = ex.Message,
                    detail = ex.StackTrace
                });
            }
        }
        
        public class IncrementDecrementFromCollectionRequest
        {
            public int UserProfileId { get; set; }
            public int PrintID { get; set; }
            public bool Increment { get; set; }
        }
        
    }
}