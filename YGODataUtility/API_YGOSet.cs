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
        static private readonly int GameID = 1;

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
            commandText = "INSERT INTO CardSet (GameID, SetName, SetCode";
            if (tcg_date != null) { commandText += ", ReleaseDate"; }

            commandText += ") VALUES ((SELECT GameID FROM CardGame WHERE GameID = @gameID), " +
                "@setName, @setCode";
            if (tcg_date != null) { commandText += ", @releaseDate"; }

            commandText += ");";


            // Add parameter values
            SqlCommand cmd = new SqlCommand(commandText);
            cmd.Parameters.AddWithValue("@gameID", GameID);
            cmd.Parameters.AddWithValue("@setName", set_name);
            cmd.Parameters.AddWithValue("@setCode", set_code);

            if (tcg_date != null) { cmd.Parameters.AddWithValue("@releaseDate", DateTime.Parse(tcg_date).Date); }


            return cmd;
        }
    }
}
