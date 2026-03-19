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

            try
            {
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
                                CardID = reader["CardID"]?.ToString() ?? string.Empty,
                                PrintID = reader["PrintID"]?.ToString(), //PrintID is being read here.
                                name = reader["CardName"]?.ToString() ?? string.Empty,
                                superType = reader["SuperType"]?.ToString() ?? string.Empty,
                                subType = reader["SubType"]?.ToString() ?? string.Empty,
                                cardText = reader["CardText"]?.ToString() ?? "No description available.",
                                attribute = reader["Attribute"] == DBNull.Value ? null : reader["Attribute"].ToString(),
                                level = reader["CardLevel"] as int?,
                                Atk = reader["AttackValue"] as int?,
                                Def = reader["DefenseValue"] as int?,
                                PendulumScale = reader["PendulumScale"] as int?,
                                LinkRating = reader["LinkRating"] as int?
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving card data.", error = ex.Message });
            }
        }
    }
}