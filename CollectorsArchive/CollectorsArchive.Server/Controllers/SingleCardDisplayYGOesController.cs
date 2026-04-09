using CollectorsArchive.Server.Models.ApiInput;
using CollectorsArchive.Server.Models.ApiOutput;
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
        public async Task<IActionResult> SingleYGOesCardDisplay([FromBody] CardDetailsRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.CardID))
            {
                return BadRequest(new { message = "The ID of the YGO card is required." });
            }

            try
            {
                string connectionString = _configuration.GetConnectionString("ErmiyasDb");

                // List<CardDisplayYGO> cardDisplayYGO = new();
                // List<PrintInfoDisplayDetails> printInfoDisplayDetails = new();

                List<CardInformation> cardDisplayYGO = new();
                List<PrintingInformation> printInfoDisplayDetails = new();

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    await conn.OpenAsync();

                    SqlCommand cmd = new SqlCommand();
                    switch (request.GameID)
                    {
                        case 1:
                            cmd.CommandText = "DisplayCardYGO";
                            break;
                        case 2:
                            cmd.CommandText = "DisplayCardMTG";
                            break;
                    }
                    cmd.Connection = conn;
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@CardID", request.CardID);

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            switch (request.GameID)
                            {
                                case 1:
                                    cardDisplayYGO.Add(new CardInformation
                                    {
                                        GameID = reader.GetInt32("GameID"),
                                        CardID = reader["CardID"]?.ToString() ?? string.Empty,
                                        CardName = reader["CardName"]?.ToString() ?? string.Empty,
                                        CardText = reader["CardText"]?.ToString() ?? "No description available.",
                                        CardAttributes = new YGOCard
                                        {
                                            SuperType = reader["SuperType"]?.ToString() ?? string.Empty,
                                            SubType = reader["SubType"]?.ToString() ?? string.Empty,
                                            Attribute = reader["Attribute"] == DBNull.Value ? null : reader["Attribute"].ToString(),
                                            Level = reader["CardLevel"] as byte?,
                                            Attack = reader["AttackValue"] as short?,
                                            Defense = reader["DefenseValue"] as short?,
                                            PendulumScale = reader["PendulumScale"] as byte?,
                                            LinkRating = reader["LinkRating"] as byte?
                                        }
                                    });
                                    break;
                                case 2:
                                    cardDisplayYGO.Add(new CardInformation 
                                    {
                                        GameID = reader.GetInt32("GameID"),
                                        CardID = reader["CardID"]?.ToString() ?? string.Empty,
                                        CardName = reader["CardNameEN"]?.ToString() ?? string.Empty,
                                        CardText = reader["CardTextEN"]?.ToString() ?? "No description available.",
                                        CardAttributes = new MTGCard 
                                        {
                                            ManaCost = reader["CardManaCost"].ToString() ?? string.Empty,
                                            SuperType = reader["SuperType"].ToString() ?? string.Empty,
                                            Type = reader["CardType"].ToString() ?? string.Empty,
                                            SubTypes = reader["SubTypes"].ToString() ?? string.Empty,
                                            Power = reader["PowerValue"].ToString() ?? string.Empty,
                                            Toughness = reader["ToughnessValue"].ToString() ?? string.Empty
                                        }
                                    });
                                    break;
                            }
                        }
                    }



                    //// calling the procedure that Get card details here 
                    //using (SqlCommand cmdForDisplayCardDetails = new SqlCommand("DisplayCardYGO", conn))
                    //{
                    //    cmdForDisplayCardDetails.CommandType = CommandType.StoredProcedure;
                    //    cmdForDisplayCardDetails.Parameters.AddWithValue("@CardID", request.CardID);

                    //    using (SqlDataReader reader = await cmdForDisplayCardDetails.ExecuteReaderAsync())
                    //    {
                    //        while (await reader.ReadAsync())
                    //        {
                    //            cardDisplayYGO.Add(new CardInformation
                    //            {
                    //                GameID = reader.GetInt32("GameID"),
                    //                CardID = reader["CardID"]?.ToString() ?? string.Empty,
                    //                CardName = reader["CardName"]?.ToString() ?? string.Empty,
                    //                CardText = reader["CardText"]?.ToString() ?? "No description available.",
                    //                CardAttributes = new YGOCard 
                    //                {
                    //                    SuperType = reader["SuperType"]?.ToString() ?? string.Empty,
                    //                    SubType = reader["SubType"]?.ToString() ?? string.Empty,
                    //                    Attribute = reader["Attribute"] == DBNull.Value ? null : reader["Attribute"].ToString(),
                    //                    Level = reader["CardLevel"] as byte?,
                    //                    Attack = reader["AttackValue"] as short?,
                    //                    Defense = reader["DefenseValue"] as short?,
                    //                    PendulumScale = reader["PendulumScale"] as byte?,
                    //                    LinkRating = reader["LinkRating"] as byte?
                    //                }
                    //            });
                    //        }
                    //    }
                    //}

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
                                //printInfoDisplayDetails.Add(new PrintInfoDisplayDetails
                                //{
                                //    PrintID = reader.GetInt32("PrintID"),
                                //    SetCode = reader["SetCode"]?.ToString() ?? string.Empty,
                                //    SetName = reader["SetName"]?.ToString() ?? string.Empty,
                                //    CardRarity = reader["CardRarity"]?.ToString() ?? string.Empty,
                                //    ReleaseDate = reader["ReleaseDate"] as DateTime? ?? DateTime.Now
                                //});
                                printInfoDisplayDetails.Add(new PrintingInformation
                                {
                                    GameID = reader.GetInt32("GameID"),
                                    PrintID = reader.GetInt32("PrintID"),
                                    CardSetID = reader.GetInt32("CardSetID"),
                                    SetCode = reader["SetCode"]?.ToString() ?? string.Empty,
                                    SetName = reader["SetName"]?.ToString() ?? string.Empty,
                                    Rarity = reader["CardRarity"]?.ToString() ?? string.Empty,
                                    ReleaseDate = reader["ReleaseDate"] as DateTime? ?? DateTime.Now
                                });
                            }
                        }
                    }
                }

                return Ok(new
                {
                    message = "Here is the card detail information.",
                    cardsInfo = cardDisplayYGO.First(),
                    printsInfo = printInfoDisplayDetails
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving card data.", error = ex.Message });
            }
        }
    }
}
