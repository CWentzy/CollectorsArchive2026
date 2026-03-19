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
                string connectionString = _configuration.GetConnectionString("ErmiyasDb");

                List<CardDisplayYGO> cardDisplayYGO = new();
                List<PrintInfoDisplayDetails> printInfoDisplayDetails = new();

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    await conn.OpenAsync();

                    // calling the procedure that Get card details here 
                    using (SqlCommand cmdForDisplayCardDetails = new SqlCommand("DisplayCardYGO", conn))
                    {
                        cmdForDisplayCardDetails.CommandType = CommandType.StoredProcedure;
                        cmdForDisplayCardDetails.Parameters.AddWithValue("@CardID", request.CardID);

                        using (SqlDataReader reader = await cmdForDisplayCardDetails.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                cardDisplayYGO.Add(new CardDisplayYGO
                                {
                                    CardID = reader["CardID"]?.ToString() ?? string.Empty,
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

                    // calling the second procedure that call the printing 
                    using (SqlCommand cmdGetPrintingDetails = new SqlCommand("DisplayCardPrintings", conn))
                    {
                        cmdGetPrintingDetails.CommandType = CommandType.StoredProcedure;
                        cmdGetPrintingDetails.Parameters.AddWithValue("@CardID", request.CardID);

                        using (SqlDataReader reader = await cmdGetPrintingDetails.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                printInfoDisplayDetails.Add(new PrintInfoDisplayDetails
                                {
                                    PrintID = reader["PrintID"]?.ToString() ?? string.Empty,
                                    SetCode = reader["SetCode"]?.ToString() ?? string.Empty,
                                    SetName = reader["SetName"]?.ToString() ?? string.Empty,
                                    CardRarity = reader["CardRarity"]?.ToString() ?? string.Empty,
                                    ReleaseDate = reader["ReleaseDate"] as DateTime? ?? DateTime.Now
                                });
                            }
                        }
                    }
                }

                return Ok(new
                {
                    message = "Here is the card detail information.",
                    card = cardDisplayYGO.First(),
                    printings = printInfoDisplayDetails
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving card data.", error = ex.Message });
            }
        }
    }
}
