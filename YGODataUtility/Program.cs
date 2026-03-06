/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        Program.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Console tool for creating/updating the Yu-Gi-Oh card listings in the database.
 * 
 *                  Currently adds all sets, card, and printings WITHOUT CHECKING FOR DUPLICATES.
 *                  functionality for updating the database coming soon.
 */

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Threading;

namespace YGODataUtility
{
    internal class Program
    {
        const string _folderImages = "\\images";
        const string _folderImagesLarge = "\\images\\large";
        const string _folderImagesSmall = "\\images\\small";
        const string _connectionString = "Data Source=localhost;" +
                                            "Initial Catalog=CollectorsArchive;" +
                                            "Integrated Security=true;";

        static void Main(string[] args)
        {
            Directory.CreateDirectory(Directory.GetCurrentDirectory() + _folderImages);
            Directory.CreateDirectory(Directory.GetCurrentDirectory() + _folderImagesLarge);
            Directory.CreateDirectory(Directory.GetCurrentDirectory() + _folderImagesSmall);

            SqlConnection conn = new SqlConnection(_connectionString);

            // ----- Retrieve all sets -----
            Console.Write("Retrieving Set Data...");
            List<API_YGOSet> allSets = new List<API_YGOSet>();
            if (!API_YGO.RetrieveSetData(ref allSets))
            {
                Console.WriteLine("Something went wrong. Exiting Program.");
                return;
            }
            Console.WriteLine("Done.");


            // ----- Inserting/Updating all sets -----
            using (conn)
            {
                conn.Open();
                SqlCommand cmd = conn.CreateCommand();
                foreach (API_YGOSet set in allSets)
                {
                    cmd = set.GetInsertCommand();
                    cmd.Connection = conn;
                    cmd.ExecuteNonQuery();
                }
            }


            // ----- Retrieve all cards -----
            Console.Write("Retrieving Card Data...");
            API_YGOCardDataHolder allCards = new API_YGOCardDataHolder();
            if (!API_YGO.RetrieveCardDataAll(ref allCards))
            {
                Console.WriteLine("Something went wrong. Exiting Program.");
                return;
            }
            Console.WriteLine("Done.");


            // ----- Inserting all cards and printings -----
            conn = new SqlConnection(_connectionString);
            using (conn)
            {
                conn.Open();
                SqlCommand cmd = conn.CreateCommand();
                foreach (API_YGOCard card in allCards.data)
                {
                    Console.WriteLine(card.name);
                    cmd = card.GetInsertCommand();
                    cmd.Connection = conn;
                    cmd.ExecuteNonQuery();

                    if (card.card_sets != null)
                    {
                        foreach (API_YGOCardPrinitng printing in card.card_sets)
                        {
                            Console.WriteLine($"\t{printing.set_name}");
                            cmd = printing.GetInsertCommand(conn, card.idString);
                            cmd.Connection = conn;
                            cmd.ExecuteNonQuery();
                        }
                    }
                }
            }

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

            API_YGOCardAltLanguageDataHolder altCards = new API_YGOCardAltLanguageDataHolder();
            foreach (string lang in API_YGO._APIAltLanguages)
            {
                if (!API_YGO.RetrieveCardAltLanguageData(ref altCards, lang))
                {
                    Console.WriteLine("Something went wrong.");
                    continue;
                }

                conn = new SqlConnection(_connectionString);
                using (conn)
                {
                    conn.Open();
                    SqlCommand cmd = conn.CreateCommand();
                    foreach (API_YGOCardAltLanguage card in altCards.data)
                    {
                        Console.WriteLine(card.name);
                        cmd = card.GetInsertCommand(lang);
                        cmd.Connection = conn;
                        cmd.ExecuteNonQuery();
                    }
                }
            }
        }
    }
}
