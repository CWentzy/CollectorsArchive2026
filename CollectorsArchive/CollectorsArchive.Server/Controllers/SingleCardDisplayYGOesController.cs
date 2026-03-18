using CollectorsArchive.Server.Models;
using CollectorsArchive.Server.Models.CardDisplays;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace CollectorsArchive.Server.Controllers
{
    public class SingleCardDisplayYGOesController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public SingleCardDisplayYGOesController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("SingleCardDisplayYGO")]
        public async Task<IActionResult> SingleYGOesCardDisplay([FromBody] CardDisplayYGO CardID)
        {
            if (string.IsNullOrWhiteSpace(CardID.CardID))
            {
                return BadRequest(new { message = "The ID og YGOes Card is required." });
            }

            // declaring the store procedure that im calling from db 
            string singleCardDisplayProcedure = "DisplayCardYGO";

            List<CardDisplayYGO> cardDisplayYGO = new List<CardDisplayYGO>();

            string connectionString = _configuration.GetConnectionString("ErmiyasDb");

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand command = new SqlCommand(singleCardDisplayProcedure, conn))
            {
                // declare the procedure that im calling
                command.CommandType = CommandType.StoredProcedure;

                // the the store proc accept 1 parameter so i send it with the user name 
                command.Parameters.AddWithValue("@CardID", CardID.CardID);

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
            attribute = reader["Attribute"] == DBNull.Value ? null : reader["Attribute"].ToString(),
            classifications = reader["Classifications"] == DBNull.Value
                ? null
                : reader["Classifications"].ToString().Split(','),

            level = reader["Level"] == DBNull.Value ? null : Convert.ToInt32(reader["Level"]),
            Atk = reader["Atk"] == DBNull.Value ? null : Convert.ToInt32(reader["Atk"]),
            Def = reader["Def"] == DBNull.Value ? null : Convert.ToInt32(reader["Def"])
        });
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