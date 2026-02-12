/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        API_YGOSet.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the de-serialized data from the YGOPRODECK set list API. The API
 *                  currently includes values that we are not using and cannot be removed from the
 *                  returning data.
 */

using System;
using System.IO;
using System.Collections.Generic;
using System.Text.Json;
using System.Net.Http;

namespace YGODataUtility
{
    public static class API_YGO
    {
        // ----- API String -----
        const string _APISetEndpoint = "https://db.ygoprodeck.com/api/v7/cardsets.php";
        const string _APICardEndpoint = "https://db.ygoprodeck.com/api/v7/cardinfo.php";

        const string _APIExtensionSetSearch = "cardset=";
        const string _APISpaceEscape = "%20";               // Used to escape spaces in set names

        // ----- Here for testing. Please move at a later time. -----
        const string _connectionString = "Data Source=localhost;" +
                         "Initial Catalog=CollectorsArchive;" +
                         "Integrated Security=true;";


        // --------------------------------- API DATA RETRIEVAL -------------------------------- //

        /// <summary>
        /// Performs a call to the API and returns a list of de-serialized set objects.
        /// </summary>
        /// <param name="data">List of set objects to store the de-serialized data</param>
        /// <returns>Operation Success Status</returns>
        public static bool RetrieveSetData(ref List<API_YGOSet> data)
        {
            bool result = true;

            try
            {
                HttpClient client = new HttpClient();
                var response = client.GetAsync(_APISetEndpoint).Result;

                // ----- Should add an additional check for valid JSON -----

                data = JsonSerializer.Deserialize<List<API_YGOSet>>(response.Content.ReadAsStringAsync().Result);
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
        /// <param name="data">List of set objects to store the de-serialized data</param>
        /// <param name="filename">Local filename</param>
        /// <returns>Operation Success Status</returns>
        public static bool RetreiveSetDataFromFile(ref List<API_YGOSet> data, string filename = "")
        {
            if (!File.Exists(filename)) { return false; }

            // ----- Should add an additional check for valid JSON -----

            data = JsonSerializer.Deserialize<List<API_YGOSet>>(File.ReadAllText(filename));
            
            return true;
        }
    }
}
