/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        CardSearchController.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Controls searches within the card database called by the client. The Client
 *                  application allows for searching the database for a Card list tied to a
 *                  single Set, using a set of card attributes or through a Computer Vision system
 *                  that captures specific print info.
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Text;

using CollectorsArchive.Server.Models.CardSearch;


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
        public IEnumerable<SearchOutputCard> AdvancedSearchBySet([FromBody] AdvancedSearch parameters)
        {
            List<SearchOutputCard> results = new();
            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("ErmiyasDB")))
            {
                conn.Open();
                SqlCommand cmd = new SqlCommand();

                cmd.CommandText = "AdvancedSearchBySet";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@GameID", parameters.game);
                cmd.Parameters.AddWithValue("@SetName", parameters.query);

                cmd.Connection = conn;
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    results.Add(new SearchOutputCard
                    {
                        CardID = reader.GetString(0),
                        CardName = reader.GetString(1),
                        PrintInfo = new SearchOutputPrinting
                        {
                            PrintID = "Test",
                            SetCode = reader.GetString(2),
                            CardRarity = reader.GetString(3)
                        }
                    });
                }
            }

            return results;
        }


        /// <summary>
        /// Performs a search through a specified card database using card attributes specified
        /// through the client UI.
        /// </summary>
        /// <param name="parameters">Search Parameters</param>
        /// <returns>Card List</returns>
        [HttpPost("AdvancedSearchCard")]
        public IEnumerable<SearchOutputCard> AdvancedSearchByCard([FromBody] AdvancedSearch parameters)
        {
            List<SearchOutputCard> results = new();

            SqlCommand cmd = new SqlCommand();

            cmd = GetSearchStringCardYGO(parameters);
            using (SqlConnection conn = new SqlConnection(_configuration.GetConnectionString("ErmiyasDB")))
            {
                conn.Open();
                cmd.Connection = conn;

                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    results.Add(new SearchOutputCard
                    {
                        CardID = reader.GetString(0),
                        CardName = reader.GetString(1)
                    });
                }
            }

            return results;
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

            query.Append("SELECT YGOCard.CardID, YGOCard.CardName" +
                         "FROM YGOCard" +
                            "JOIN");

            // Adjust search query to reflect the parameters provided by the user
            StringBuilder queryParameters = new StringBuilder();
            AdvancedSearchFiltersYGO filters = (AdvancedSearchFiltersYGO)parameters.advancedFilters;

            if (parameters.query != null) { queryParameters.Append($"YGOCard.CardName LIKE '%{parameters.query}%'"); }

            // Filters with the ability to select multiples
            //queryParameters.Append(SetupMultiParameter(filters.superTypes));
            //queryParameters.Append(SetupMultiParameter(filters.subTypes));
            //queryParameters.Append(SetupMultiParameter(filters.attributes));


            result.CommandText = query.ToString();
            return result;
        }

        //private string SetupMultiParameter(string[]? selectedOptions)
        //{
        //    if (selectedOptions == null || selectedOptions.Length < 1) { return string.Empty; }
        //    else if (selectedOptions.Length == 1)
        //    {

        //    }
        //    else
        //    {

        //    }

        //}

        //private string SetupRangeParameter(int[]? selectedOptions)
        //{

        //}
    }
}
