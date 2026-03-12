using CollectorsArchive.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace CollectorsArchive.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DisplayCollectionController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public DisplayCollectionController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("DisplayCollection")]
        public async Task<IActionResult> DisplayCollection([FromBody] UserNameRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.UserName))
            {
                return BadRequest(new { message = "Username is required." });
            }

            // declaring the store procedure that im calling from db 
            string collectionStoreProcedureName = "DisplayUserCollection";

            List<DisplayCollectionModel> cardCollection = new List<DisplayCollectionModel>();

            string connectionString = _configuration.GetConnectionString("ErmiyasDb");

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand command = new SqlCommand(collectionStoreProcedureName, conn))
            {
                // declare the procedure that im calling
                command.CommandType = CommandType.StoredProcedure;

                // the the store proc accept 1 parameter so i send it with the user name 
                command.Parameters.AddWithValue("@UserName", request.UserName);

                await conn.OpenAsync();

                using (SqlDataReader reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        cardCollection.Add(new DisplayCollectionModel
                        {
                            CardID = reader["CardID"].ToString(),
                            CardName = reader["CardName"].ToString()
                        });
                    }
                }
            }

            if (cardCollection == null || cardCollection.Count == 0)
            {
                return NotFound(new { message = "No collection found for this user." });
            }

            return Ok(new
            {
                message = "Collection retrieved successfully.",
                userName = request.UserName,
                collection = cardCollection
            });
        }
    }

    public class UserNameRequest
    {
        public string UserName { get; set; }
    }
}
