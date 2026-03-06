/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        API_YGO.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Static utility class for accessing the Yu-Gi-Oh API used to fill the database
 *                  and to Reset and INSERT data from the API into the database.
 *                  API documentation here: https://ygoprodeck.com/api-guide/
 */

using System;
using System.IO;
using System.Collections.Generic;
using System.Text.Json;
using System.Net.Http;
using System.Data.SqlClient;

namespace YGODataUtility
{

    public static class API_YGO
    {
        // ------------------------------------- CONSTANTS ------------------------------------- //

        // ----- API String -----
        const string _APISetEndpoint = "https://db.ygoprodeck.com/api/v7/cardsets.php";
        const string _APICardEndpoint = "https://db.ygoprodeck.com/api/v7/cardinfo.php";


        // ----- API Data Modifiers -----
        const string _APIExtensionSetSearch = "cardset=";   // Specifiy single card set by name
        const string _APISpaceEscape = "%20";               // Used to escape spaces in set names

        const string _APIExtensionLanguage = "?language=";
        static public readonly string[] _APIAltLanguages = { "fr", "de", "it", "pt" };


        // --------------------------- API DATA RETRIEVAL - CARD SET --------------------------- //

        /// <summary>
        /// Performs a call to the API and returns a list of de-serialized set objects.
        /// </summary>
        /// <param name="data">Reference to list of set objects</param>
        /// <returns>Operation Success Status</returns>
        public static bool RetrieveSetData(ref List<API_YGOSet> data)
        {
            bool result = true;

            try
            {
                HttpClient client = new HttpClient();
                var response = client.GetAsync(_APISetEndpoint).Result;

                string responsedata = response.Content.ReadAsStringAsync().Result;
                // ----- Should add an additional check for valid JSON -----

                data = JsonSerializer.Deserialize<List<API_YGOSet>>(responsedata);
            }
            catch (Exception)
            {
                result = false;
            }

            return result;
        }


        /// <summary>
        /// Retrieves API data from a local file and returns a list of de-serialized set objects.
        /// </summary>
        /// <param name="data">Reference to list of set objects</param>
        /// <param name="filename">Local filename</param>
        /// <returns>Operation Success Status</returns>
        public static bool RetreiveSetDataFromFile(ref List<API_YGOSet> data, string filename = "")
        {
            if (!File.Exists(filename)) { return false; }

            string filedata = File.ReadAllText(filename);
            // ----- Should add an additional check for valid JSON -----

            data = JsonSerializer.Deserialize<List<API_YGOSet>>(filedata);
            
            return true;
        }


        // --------------------------- API DATA RETRIEVAL - CARD DATA -------------------------- //

        /// <summary>
        /// Performs a call to the API and returns a list of de-serialized card objects.
        /// </summary>
        /// <param name="data">Reference to card holder object</param>
        /// <returns></returns>
        public static bool RetrieveCardDataAll(ref API_YGOCardDataHolder data)
        {
            bool result = true;

            try
            {
                HttpClient client = new HttpClient();
                var response = client.GetAsync(_APICardEndpoint).Result;

                string responsedata = response.Content.ReadAsStringAsync().Result;
                // ----- Should add an additional check for valid JSON -----

                data = JsonSerializer.Deserialize<API_YGOCardDataHolder>(responsedata);
            }
            catch (Exception)
            {
                result = false;
            }

            return result;
        }


        /// <summary>
        /// Retrieves API data from a local file and returns a list of de-serialized set objects.
        /// </summary>
        /// <param name="data">Reference to card holder object</param>
        /// <param name="filename">Local filename</param>
        /// <returns>Operation Success Status</returns>
        public static bool RetreiveCardDataAllFromFile(ref API_YGOCardDataHolder data, string filename = "")
        {
            if (!File.Exists(filename)) { return false; }

            string filedata = File.ReadAllText(filename);
            // ----- Should add an additional check for valid JSON -----

            data = JsonSerializer.Deserialize<API_YGOCardDataHolder>(filedata);

            return true;
        }


        // --------------------------- API DATA RETRIEVAL - CARD DATA -------------------------- //

        public static bool RetrieveCardAltLanguageData(ref API_YGOCardAltLanguageDataHolder data, string index)
        {
            bool result = true;

            try
            {
                HttpClient client = new HttpClient();
                var response = client.GetAsync(_APICardEndpoint + _APIExtensionLanguage + index).Result;

                string responsedata = response.Content.ReadAsStringAsync().Result;
                // ----- Should add an additional check for valid JSON -----

                data = JsonSerializer.Deserialize<API_YGOCardAltLanguageDataHolder>(responsedata);
            }
            catch (Exception)
            {
                result = false;
            }

            return result;
        }



        // ----------------------------------- DATABASE RESET ---------------------------------- //

        /// <summary>
        /// ----- MADE FOR TESTING -----
        /// Removes ALL records from the Yu-Gi-Oh 
        /// </summary>
        public static void YGODataReset()
        {

        }


        // ---------------------------------- DATABASE INSERT ---------------------------------- //

        public static bool InsertSetData(SqlConnection conn, List<API_YGOSet> data)
        {
            bool result = true;

            return result;
        }


        public static bool InsertCardData(SqlConnection conn, List<API_YGOCard> data)
        {
            bool result = true;

            return result;
        }


        public static bool InsertPrintingData(SqlConnection conn, List<API_YGOCardPrinitng> data)
        {
            bool result = true;

            return result;
        }
    }
}
