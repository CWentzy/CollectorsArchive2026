/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        API_YGOSet.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the de-serialized data from the YGOPRODECK set list API. Includes
 *                  functions creating SQL statements for INSERT operations.
 */

using System;
using System.Data.SqlClient;

namespace YGODataUtility
{
    public class API_YGOSet
    {

        // ------------------------------------- PROPERTIES ------------------------------------ //

        // ----- Yu-Gi-Oh SetID in the Database -----
        static private readonly int SetID = 1;

        public string set_name { get; set; }
        public string set_code { get; set; }
        public string tcg_date { get; set; }
        public string set_image { get; set; }       // Not currently being used by our database


        // ------------------------------------- FUNCTIONS ------------------------------------- //

        /// <summary>
        /// Creates and returns the SQL command used to insert into the database.
        /// </summary>
        /// <returns>SQL Insert Command</returns>
        public SqlCommand GetInsertCommand()
        {
            string commandText;

            // This accounts for (currently 2) sets that do not have a recorded release date,
            // leaving the release date field NULL.
            if (tcg_date != null)
            {
                commandText = "INSERT INTO CardSet (GameID, SetName, SetCode, ReleaseDate) VALUES " +
                                "((SELECT GameID FROM CardGame WHERE GameID = @gameID), " +
                                "@setName, @setCode, @releaseDate);";
            }
            else
            {
                commandText = "INSERT INTO CardSet (GameID, SetName, SetCode) VALUES " +
                                "((SELECT GameID FROM CardGame WHERE GameID = @gameID), " +
                                "@setName, @setCode);";
            }

            SqlCommand cmd = new SqlCommand(commandText);
            cmd.Parameters.AddWithValue("@gameID", SetID);
            cmd.Parameters.AddWithValue("@setName", set_name);
            cmd.Parameters.AddWithValue("@setCode", set_code);
            
            if (tcg_date != null) { cmd.Parameters.AddWithValue("@releaseDate", DateTime.Parse(tcg_date).Date); }

            return cmd;
        }
    }
}
