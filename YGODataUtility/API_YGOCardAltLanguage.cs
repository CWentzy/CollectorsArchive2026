/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        API_YGOCardAltLanguage.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the de-serialized data from the YGOPRODECK card list API. This object
 *                  only models the name and effect text as other fields use pre-defined values
 *                  that will have alternative language values.
 */

using System;
using System.Collections.Generic;
using System.Data.SqlClient;

namespace YGODataUtility
{
    public class API_YGOCardAltLanguageDataHolder
    {
        private string languageCode;
        public List<API_YGOCardAltLanguage> data { get; set; }


        public API_YGOCardAltLanguageDataHolder(string languageCode)
        {
            this.languageCode = languageCode;
        }
    }


    public class API_YGOCardAltLanguage
    {
        public int id { get; set; }
        public string name { get; set; }
        public string desc { get; set; }



        public SqlCommand GetInsertCommand(string languageCode)
        {
            string nameColumn = string.Empty;
            string descColumn = string.Empty;
            SqlCommand cmd = new SqlCommand();

            switch (languageCode)
            {
                case "fr":
                    nameColumn = "CardNameFR";
                    descColumn = "CardTextFR";
                    break;
                case "ge":
                    nameColumn = "CardNameGE";
                    descColumn = "CardTextGE";
                    break;
                case "it":
                    nameColumn = "CardNameIT";
                    descColumn = "CardTextIT";
                    break;
                case "pt":
                    nameColumn = "CardNamePT";
                    descColumn = "CardTextPT";
                    break;
            }

            cmd.CommandText = "UPDATE YGOCard SET " + nameColumn + " = @name, " + 
                                descColumn + " = @desc " +
                                "WHERE CardID = @id";

            cmd.Parameters.AddWithValue("@name", name);
            cmd.Parameters.AddWithValue("@desc", desc);
            cmd.Parameters.AddWithValue("@id", id);

            return cmd;
        }
    }
}
