using CollectorsArchive.Server.Models.CardDisplays;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace CollectorsArchive.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SingleCardDisplayYGOesController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public SingleCardDisplayYGOesController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("SingleCardDisplayYGO")]
        public async Task<IActionResult> SingleYGOesCardDisplay([FromBody] CardDisplayYGO request)
        {
            if (string.IsNullOrWhiteSpace(request.CardID))
            {
                return BadRequest(new { message = "The ID of the YGO card is required." });
            }

            string procedureName = "DisplayCardYGO";
            List<CardDisplayYGO> cardDisplayYGO = new List<CardDisplayYGO>();

            string connectionString = _configuration.GetConnectionString("ErmiyasDb");

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand command = new SqlCommand(procedureName, conn))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@CardID", request.CardID);

                await conn.OpenAsync();

                using (SqlDataReader reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        cardDisplayYGO.Add(new CardDisplayYGO
                        {
                            CardID = reader["CardID"].ToString(),
                            name = reader["CardName"].ToString(),
                            superType = reader["SuperType"].ToString(),
                            subType = reader["SubType"].ToString(),
                            cardText = reader["CardText"].ToString(),

                            attribute = reader["Attribute"] == DBNull.Value
                                ? null
                                : reader["Attribute"].ToString(),

                            // Stored procedure does NOT return Classifications
                            classifications = null,

                            level = reader["CardLevel"] == DBNull.Value
                                ? null
                                : Convert.ToInt32(reader["CardLevel"]),

                            Atk = reader["AttackValue"] == DBNull.Value
                                ? null
                                : Convert.ToInt32(reader["AttackValue"]),

                            Def = reader["DefenseValue"] == DBNull.Value
                                ? null
                                : Convert.ToInt32(reader["DefenseValue"])
                        });
                    }
                }

            }

            if (cardDisplayYGO.Count == 0)
            {
                return NotFound(new { message = "No card detail information found for this Card ID." });
            }

            return Ok(new
            {
                message = "Here is the card detail information.",
                card = cardDisplayYGO.First()
            });
        }
    }
}
