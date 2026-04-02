/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        Program.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Console tool for creating/updating the Yu-Gi-Oh card listings in the database.
 *                  Retreives the data from the API and compares it to our current database, adding
 *                  all sets, cards and printing that are not present within our database.
 */

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Threading;

namespace YGODataUtility
{
    internal class Program
    {
        static readonly string _connectionString = ConfigurationManager.ConnectionStrings["CollectorsArchive"].ConnectionString;

        static void Main(string[] args)
        {

            bool loop = true;
            while (loop)
            {
                Console.Clear();
                Console.WriteLine("===== SELECT AN OPTION =====");
                Console.WriteLine("1. Check for new data\n" +
                                  "2. Update alternate language data\n" +
                                  "3. Update card classification\n" +
                                  "4. Exit");
                Console.Write("Option: ");

                switch (Console.ReadLine())
                {
                    case "1":
                        SetData();
                        CardData();

                        Console.WriteLine("Press any key to finish...");
                        Console.ReadKey();

                        break;
                    case "2":
                        UpdateAltLanguageData();

                        Console.WriteLine("Press any key to finish...");
                        Console.ReadKey();

                        break;
                    case "3":
                        UpdateClassificationData();
                        break;
                    case "4":
                        loop = false;
                        break;
                }
            }

            //Directory.CreateDirectory(Directory.GetCurrentDirectory() + "\\images");
            //Directory.CreateDirectory(Directory.GetCurrentDirectory() + "\\images\\large");
            //Directory.CreateDirectory(Directory.GetCurrentDirectory() + "\\images\\small");

            // ----- DO NOT USE -----
            // ----- THE API WILL BLACKLIST YOU BEFORE FINISHING -----
            //foreach (API_YGOCard card in allCards.data)
            //{
            //    Console.WriteLine(card.name);
            //    for (int i = 0; i < card.card_images.Count; i++)
            //    {
            //        card.card_images[i].RetrieveImages(card.idString + "_" + (i + 1));
            //        Thread.Sleep(250);
            //    }
            //}
        }


        // ---------------------------------- UPDATE SET DATA ---------------------------------- //

        /// <summary>
        /// 
        /// </summary>
        static void SetData()
        {
            // ----- Retrieve all sets -----
            Console.Write("\nRetrieving Set Data...");
            List<API_YGOSet> allSets = new List<API_YGOSet>();
            if (!API_YGO.RetrieveSetData(ref allSets))
            {
                Console.WriteLine("\nUnable to retrieve Card Set Data.");
                return;
            }
            Console.WriteLine("Done.");


            // ----- Inserting/Updating all sets -----
            Console.WriteLine("Updating Set Data...");
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                for (int i = 0; i < allSets.Count; i++)
                {
                    Console.Write($"\rUpdating Sets: {i + 1}/{allSets.Count}");
                    UpdateSetData(conn, allSets[i]);
                }
            }
            Console.WriteLine("\nDone.\n");
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="conn"></param>
        /// <param name="set"></param>
        static void UpdateSetData(SqlConnection conn, API_YGOSet set)
        {
            SqlCommand cmd = conn.CreateCommand();

            cmd.CommandText = "SELECT * FROM CardSet WHERE GameID = 1 AND SetName = @name";
            cmd.Parameters.AddWithValue("@name", set.set_name);
            cmd.Connection = conn;
            object result = cmd.ExecuteScalar();

            if (result == null) { cmd = set.GetInsertCommand(); }
            else { return; }

            Console.WriteLine(set.set_name);
            cmd.Connection = conn;
            cmd.ExecuteNonQuery();
        }


        // ---------------------------------- UPDATE CARD DATA --------------------------------- //

        /// <summary>
        /// 
        /// </summary>
        static void CardData()
        {
            // ----- Retrieve all cards -----
            Console.Write("Retrieving Card Data...");
            API_YGOCardDataHolder allCards = new API_YGOCardDataHolder();
            if (!API_YGO.RetrieveCardDataAll(ref allCards))
            {
                Console.WriteLine("Unable to retrieve Card Data.");
                return;
            }
            Console.WriteLine("Done.");


            // ----- Inserting all cards and printings -----
            Console.WriteLine("Updating Card Data...");
            int addCount = 0;
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();

                for (int i = 0; i < allCards.data.Count; i++)
                {
                    Console.Write($"\rUpdating Card: {i + 1}/{allCards.data.Count}");
                    UpdateCardData(conn, allCards.data[i]);
                }
            }
            Console.WriteLine("\nDone.\n");
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="conn"></param>
        /// <param name="card"></param>
        static void UpdateCardData(SqlConnection conn, API_YGOCard card)
        {
            SqlCommand cmd = conn.CreateCommand();

            cmd.CommandText = "SELECT * FROM YGOCard WHERE CardID = @id";
            cmd.Parameters.AddWithValue("@id", card.idString);
            cmd.Connection = conn;
            object result = cmd.ExecuteScalar();

            if (result == null) { cmd = card.GetInsertCommand(); }
            else { return; }

            cmd.Connection = conn;
            cmd.ExecuteNonQuery();

            if (card.card_sets != null)
            {
                foreach (API_YGOCardPrinitng printing in card.card_sets)
                {
                    UpdatePrintingData(conn, card.idString, printing);
                }
            }
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="conn"></param>
        /// <param name="idString"></param>
        /// <param name="printing"></param>
        static void UpdatePrintingData(SqlConnection conn, string idString, API_YGOCardPrinitng printing)
        {
            SqlCommand cmd = conn.CreateCommand();

            cmd.CommandText = "SELECT * FROM CardPrinting " +
                                "JOIN CardSet ON CardPrinting.CardSetID = CardSet.CardSetID " +
                                "WHERE CardPrinting.GameID = 1 AND CardID = @id AND SetName = @set";
            cmd.Parameters.AddWithValue("@id", idString);
            cmd.Parameters.AddWithValue("@set", printing.set_name);
            cmd.Connection = conn;
            object result = cmd.ExecuteScalar();

            if (result == null) { cmd = printing.GetInsertCommand(conn, idString); }
            else { return; }

            if (cmd.CommandText != string.Empty)
            {
                cmd.Connection = conn;
                cmd.ExecuteNonQuery();
            }
        }


        /// <summary>
        /// 
        /// </summary>
        static void UpdateAltLanguageData()
        {
            API_YGOCardAltLanguageDataHolder altCards = new API_YGOCardAltLanguageDataHolder();

            for (int i = 0; i < API_YGO._APIAltLanguages.Length; i++)
            {
                Console.Write($"\nRetrieving data for language: {API_YGO._APIAltLanguages[i]}...");
                if (!API_YGO.RetrieveCardAltLanguageData(ref altCards, API_YGO._APIAltLanguages[i]))
                {
                    Console.WriteLine("Something went wrong.");
                    continue;
                }
                Console.WriteLine("Done.");

                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    conn.Open();
                    SqlCommand cmd = conn.CreateCommand();
                    Console.WriteLine("Updating Card Data...");

                    for (int j = 0; j < altCards.data.Count; j++)
                    {
                        Console.Write($"\rUpdating Card: {j + 1}/{altCards.data.Count}");
                        cmd = altCards.data[j].GetInsertCommand(API_YGO._APIAltLanguages[i]);
                        cmd.Connection = conn;
                        cmd.ExecuteNonQuery();
                    }
                    Console.WriteLine("\nDone.");
                }
            }
        }


        static void UpdateClassificationData()
        {
            // ----- Retrieve all cards -----
            Console.Write("Retrieving Card Data...");
            API_YGOCardDataHolder allCards = new API_YGOCardDataHolder();
            if (!API_YGO.RetrieveCardDataAll(ref allCards))
            {
                Console.WriteLine("Unable to retrieve Card Data.");
                return;
            }
            Console.WriteLine("Done.");

            // ----- Inserting all cards and printings -----
            Console.WriteLine("Updating Card Data...");
            int addCount = 0;
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();

                for (int i = 0; i < allCards.data.Count; i++)
                {
                    Console.Write($"\rUpdating Card: {i + 1}/{allCards.data.Count}");
                    UpdateClassifications(conn, allCards.data[i]);
                }
            }
            Console.WriteLine("\nDone.\n");
        }


        static void UpdateClassifications(SqlConnection conn, API_YGOCard card)
        {
            if (card.typeline == null) { return; }

            string classifications = card.GetClassifications();
            string commandText = "UPDATE YGOCard SET Classifications = @classifications WHERE CardID = @cardID";
            SqlCommand cmd = new SqlCommand(commandText, conn);
            cmd.Parameters.AddWithValue("@classifications", classifications);
            cmd.Parameters.AddWithValue("@cardID", card.id);
            cmd.ExecuteScalar();
        }
    }
}
