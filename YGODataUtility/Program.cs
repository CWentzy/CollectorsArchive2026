using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;

namespace YGODataUtility
{
    internal class Program
    {
        const string _connectionString = "Data Source=localhost;" +
                                            "Initial Catalog=CollectorsArchive;" +
                                            "Integrated Security=true;";

        static void Main(string[] args)
        {
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


            // Checks for sets that need to be added. If more than __ sets need to be added,
            // A full database reset is performed instead.
            //List<API_YGOSet> updates = new List<API_YGOSet>();
            //foreach (API_YGOSet set in allSets)
            //{

            //}


            // ----- Inserting all sets -----
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
            Console.Write("Retrieving Set Data...");
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
        }
    }
}
