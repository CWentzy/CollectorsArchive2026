using CollectorsArchive.Server.Models;
using CollectorsArchive.Server.Models.ApiOutput;
using CollectorsArchive.Server.Models.CardDisplays;
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

            List<CardInformation> collectionCards = [];
            List<PrintingInformation> collectionPrintings = [];

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
                        collectionCards.Add(new CardInformation
                        {
                            GameID = reader.GetInt32("GameID"),
                            CardID = reader["CardID"].ToString(),
                            CardName = reader["CardName"].ToString(),
                        });

                        collectionPrintings.Add(new PrintingInformation
                        {
                            GameID = reader.GetInt32("GameID"),
                            PrintID = reader.GetInt32("PrintID"),
                            CardSetID = reader.GetInt32("CardSetID"),
                            SetCode = reader["SetCode"]?.ToString() ?? string.Empty,
                            SetName = reader["SetName"]?.ToString() ?? string.Empty,
                            Rarity = reader["CardRarity"]?.ToString() ?? string.Empty,
                            ReleaseDate = DateTime.Now,

                            Quantity = reader["Quantity"] as int? ?? 0,
                        });
                    }
                }
            }

            //if (collectionCards == null || collectionCards.Count == 0 || collectionPrintings == null || collectionPrintings.Count == 0)
            //{
            //    return NotFound(new { message = "No collection found for this user." });
            //}

            return Ok(new
            {
                message = "Collection retrieved successfully.",
                userName = request.UserName,
                cards = collectionCards,
                printings = collectionPrintings
            });
        }
    }

    public class UserNameRequest
    {
        public string UserName { get; set; }
    }
}
