/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        API_YGOSet.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the de-serialized data from the YGOPRODECK set list API. Includes 
 *                  functions creating SQL statements for INSERT operations.
 */

using System.Data.SqlClient;
using System.Linq;

namespace YGODataUtility
{
    public class API_YGOCardPrinitng
    {
        const int _ygoGameID = 1;           // GameID used within our database

        public string set_name { get; set; }
        public string set_code { get; set; }
        public string set_rarity { get; set; }

        public SqlCommand GetInsertCommand(SqlConnection conn, string cardID)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = conn;

            string[] setCode = set_code.Split('-');

            // ----- Determine the Set ID for the current printings set
            cmd.CommandText = "SELECT CardSetID FROM CardSet WHERE SetName = @setName";
            cmd.Parameters.AddWithValue("@setName", set_name);
            int setID = (int)cmd.ExecuteScalar();


            cmd.CommandText = "INSERT INTO CardPrinting (CardID, GameID, CardSetID, CardSetIndex, CardRarity) VALUES " +
                                "(@cardID, " +
                                "(SELECT GameID FROM CardGame WHERE GameID = @gameID), " +
                                "(SELECT CardSetID FROM CardSet WHERE CardSetID = @setID), " +
                                "@setIndex, @rarity);";

            cmd.Parameters.AddWithValue("@cardID", cardID);
            cmd.Parameters.AddWithValue("@gameID", _ygoGameID);
            cmd.Parameters.AddWithValue("setID", setID);
            cmd.Parameters.AddWithValue("@setIndex", setCode.Last());
            cmd.Parameters.AddWithValue("@rarity", set_rarity);

            return cmd;
        }
    }
}
