/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        CardSearchController.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Controls searches within the card database called by the client. The Client
 *                  application allows for searching the database for a Card list tied to a
 *                  single Set, using a set of card attributes or through a Computer Vision system
 *                  that captures specific print info.
 */

using CollectorsArchive.Server.Models.ApiInput;
using CollectorsArchive.Server.Models.ApiOutput;
using CollectorsArchive.Server.Models.CardSearch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Text;


namespace CollectorsArchive.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CardSearchController : ControllerBase
    {

        private readonly IConfiguration _configuration;

        // ------------------------------------ CONSTRUCTOR ------------------------------------ //

        /// <summary>
        /// Sets up the program config file for access to the database.
        /// </summary>
        /// <param name="configuration">System configuration setup</param>
        public CardSearchController(IConfiguration configuration)
        {
            _configuration = configuration;
        }


        // ----------------------------------- POST REQUESTS ----------------------------------- //

        /// <summary>
        /// Searches for all card printings found within a given set
        /// </summary>
        /// <param name="parameters">Search parameters provided by the user</param>
        /// <returns>Card List</returns>
        [HttpPost("AdvancedSearchSet")]
        public SearchOutputResult AdvancedSearchBySet([FromBody] AdvancedSearch parameters)
        {
            List<CardInformation> cards = [];
            List<PrintingInformation> printings = [];

            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("ErmiyasDB")))
            {
                conn.Open();
                SqlCommand cmd = new SqlCommand();

                cmd.CommandText = "AdvancedSearchBySet";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@GameID", parameters.GameID);
                cmd.Parameters.AddWithValue("@SetName", parameters.Query);

                cmd.Connection = conn;

                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    cards.Add(new CardInformation
                    {
                        GameID = parameters.GameID,
                        CardID = reader["CardID"].ToString(),
                        CardName = reader["CardName"].ToString()
                    });

                    printings.Add(new PrintingInformation
                    {
                        GameID = parameters.GameID,
                        CardID = reader["CardID"].ToString(),
                        PrintID = reader.GetInt32(3),
                        SetID = reader.GetInt32(4),
                        SetName = reader["SetName"].ToString(),
                        SetCode = reader["SetCode"].ToString(),
                        Rarity = reader["CardRarity"].ToString(),
                        ReleaseDate = DateTime.MinValue
                    });
                }
            }

            return new SearchOutputResult
            {
                Cards = cards,
                Printings = printings
            };
        }


        /// <summary>
        /// Performs a search through a specified card database using card attributes specified
        /// through the client UI.
        /// </summary>
        /// <param name="parameters">Search Parameters</param>
        /// <returns>Card List</returns>
        [HttpPost("AdvancedSearchCard")]
        public SearchOutputResult AdvancedSearchByCard([FromBody] AdvancedSearch parameters)
        {
            List<CardInformation> cards = [];

            SqlCommand cmd = new SqlCommand();

            cmd = GetSearchStringCardYGO(parameters);
            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("ErmiyasDB")))
            {
                conn.Open();
                cmd.Connection = conn;

                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    cards.Add(new CardInformation
                    {
                        GameID = parameters.GameID,
                        CardID = reader.GetString(0),
                        CardName = reader.GetString(1)
                    });
                }
            }

            return new SearchOutputResult
            {
                Cards = cards
            };
        }


        [HttpPost("CVYGOSearch")]
        public SearchOutputResult CVYGOSearch([FromBody] CVSearchYGO parameters)
        {
            List<CardInformation> cards = [];
            List<PrintingInformation> printings = [];

            SqlCommand cmd = new SqlCommand();

            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("ErmiyasDB")))
            {
                conn.Open();
                cmd.CommandText = "CVSearch";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@CardID", parameters.cardID);
                cmd.Connection = conn;

                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    cards.Add(new CardInformation
                    {
                        GameID = 1, // YGO
                        CardID = reader["CardID"].ToString(),
                        CardName = reader["CardName"].ToString()
                    });

                    printings.Add(new PrintingInformation
                    {
                        GameID = 1, // YGO
                        PrintID = reader.GetInt32(3),
                        SetID = reader.GetInt32(4),
                        SetName = reader["SetName"].ToString(),
                        SetCode = reader["SetCode"].ToString(),
                        Rarity = reader["CardRarity"].ToString(),
                        ReleaseDate = DateTime.MinValue
                    });
                }
            }

            return new SearchOutputResult
            {
                Cards = cards,
                Printings = printings
            };
        }


        [HttpPost("CVMTGSearch")]
        public SearchOutputResult CVMTGSearch([FromBody] CVSearchMTG parameters)
        {
            List<CardInformation> cards = [];
            List<PrintingInformation> printings = [];

            SqlCommand cmd = new SqlCommand();

            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("ErmiyasDB")))
            {
                conn.Open();
                cmd.CommandText = "CVMTGSearch";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@CardName", parameters.cardName);
                cmd.Connection = conn;

                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    cards.Add(new CardInformation
                    {
                        GameID = 1, // YGO
                        CardID = reader["CardID"].ToString(),
                        CardName = reader["CardName"].ToString()
                    });

                    printings.Add(new PrintingInformation
                    {
                        GameID = 1, // YGO
                        PrintID = reader.GetInt32(3),
                        SetID = reader.GetInt32(4),
                        SetName = reader["SetName"].ToString(),
                        SetCode = reader["SetCode"].ToString(),
                        Rarity = reader["CardRarity"].ToString(),
                        ReleaseDate = DateTime.MinValue
                    });
                }
            }

            return new SearchOutputResult
            {
                Cards = cards,
                Printings = printings
            };
        }


        // ----------------------------------- QUERY CREATION (WIP) ---------------------------------- //

        /// <summary>
        /// Creates the SQL query statement applying the marked parameters.
        /// </summary>
        /// <param name="parameters">Search Parameters</param>
        /// <returns>SQL Command with completed command text</returns>
        private SqlCommand GetSearchStringCardYGO(AdvancedSearch parameters)
        {
            SqlCommand result = new SqlCommand();
            StringBuilder query = new StringBuilder();

            // Query Start
            query.Append("SELECT CardPrinting.GameID, CardPrinting.CardID, " +
                            "CASE " +
                                "WHEN CardPrinting.GameID = 1 THEN YGOCard.CardName " +
                                "WHEN CardPrinting.GameID = 2 THEN MTGCard.CardNameEN " +
                            "END AS 'CardName', " +
                            "CardPrinting.PrintID, CardPrinting.CardSetID, CardSet.SetName, " +
                            "CASE " +
                                "WHEN CardPrinting.GameID = 1 THEN CardSet.SetCode + '-' + CardPrinting.CardSetIndex " +
                                "WHEN CardPrinting.GameID = 2 THEN CardSet.SetCode + ' ' + CardPrinting.CardSetIndex " +
                            "END AS 'SetCode', " +
                            "CardPrinting.CardRarity, CardSet.ReleaseDate " +
                         "FROM CardPrinting " +
                            "JOIN CardSet ON CardPrinting.CardSetID = CardSet.CardSetID " +
                            "LEFT JOIN YGOCard ON CardPrinting.CardID = YGOCard.CardID " +
                            "LEFT JOIN MTGCard ON CardPrinting.CardID = MTGCard.CardID ");

            // Add Game Specific Clauses
            switch (parameters.GameID)
            {
                case 1:
                    query.Append(ParameterCheckYGO(parameters));
                    break;
                case 2:
                    query.Append(ParameterCheckMTG(parameters));
                    break;
                default:
                    query.Append(ParameterCheckALL(parameters.Query));
                    break;
            }

            // Finish Query
            query.Append("ORDER BY CardName;");

            result.CommandText = query.ToString();
            return result;
        }


        private string ParameterCheckYGO(AdvancedSearch parameters)
        {
            var filters = (SearchFiltersYGO)parameters.AdvancedFilters;
            var query = new StringBuilder();

            query.Append("WHERE CardPrinting.GameID IN (1) ");
            if (parameters.Query != string.Empty) { query.Append($"AND CardName LIKE '%{parameters.Query}%' "); }

            if (filters.superTypes != null) { query.Append($"AND CardSuperType.SuperTypeName = '{filters.superTypes}' "); }

            if (filters.subTypes != null)
            {
                query.Append("AND CardSubType.SubTypeName IN (");
                foreach (var type in filters.subTypes) { query.Append($"'{type}',"); }
                query.Remove(query.Length - 1, 1);
                query.Append(") ");
            }

            if (filters.attributes != null)
            {
                query.Append("AND MonsterAttribute.AttributeNameEN IN (");
                foreach (var attribute in filters.attributes) { query.Append($"'{attribute}',"); }
                query.Remove(query.Length - 1, 1);
                query.Append(") ");
            }

            // Determine if the classification search is an AND/OR type search
            string conjunction = string.Empty;
            if (filters.classificationOperator != null) { conjunction = filters.classificationOperator; }

            if (filters.classifications != null)
            {
                query.Append("AND (");
                foreach (var classification in filters.classifications) 
                { 
                    query.Append($"Classifications LIKE '%{classification}%' {conjunction} ");
                }
                query.Remove(query.Length - conjunction.Length + 1, conjunction.Length + 1);
                query.Append(") ");
            }
            if (filters.classificationsExcluded != null)
            {
                query.Append("AND (");
                foreach (var excluded in filters.classificationsExcluded)
                {
                    query.Append($"Classifications LIKE '%{excluded}%' AND ");
                }
                query.Remove(query.Length - 4, 4);
                query.Append(") ");
            }

            if (filters.levelRange != null) { query.Append($"AND CardLevel BETWEEN {filters.levelRange[0]} AND {filters.levelRange[1]}"); }

            if (filters.attack != null) { query.Append($"AND AttackValue BETWEEN {filters.attack[0]} AND {filters.attack[1]}"); }
            if (filters.defense != null) { query.Append($"AND DefenseValue BETWEEN {filters.defense[0]} AND {filters.defense[1]}"); }

            return query.ToString();
        }


        private string ParameterCheckMTG(AdvancedSearch parameters)
        {
            var filters = (SearchFiltersMTG)parameters.AdvancedFilters;
            var query = new StringBuilder();

            query.Append("WHERE CardPrinting.GameID IN (2) ");
            if (parameters.Query != string.Empty) { query.Append($"AND CardName LIKE '%{parameters.Query}%"); }

            return query.ToString();
        }


        private string ParameterCheckALL(string cardName)
        {
            var query = new StringBuilder();

            query.Append("WHERE CardPrinting.GameID IN (1,2) ");    // This is a quick fix
            if (cardName != string.Empty) { query.Append($"AND CardName LIKE '%{cardName}%' "); }

            return query.ToString();
        }
    }
}
