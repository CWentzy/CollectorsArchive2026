using System;
using System.Collections.Generic;
using System.Data.SqlClient;

namespace YGODataUtility
{
    internal class Program
    {
        const string _connectionString = "Data Source=localhost;" +
                                 "Initial Catalog=CollectorsArchive;" +
                                 "Integrated Security=true;";

        static void Main(string[] args)
        {
            List<API_YGOSet> data = new List<API_YGOSet>();
            if (!API_YGO.RetrieveSetData(ref data)) 
            {
                return;
            }

            SqlConnection conn = new SqlConnection(_connectionString);
            try
            {
                conn.Open();

                foreach (var item in data)
                {
                    SqlCommand cmd = item.GetInsertCommand();
                    cmd.Connection = conn;

                    cmd.ExecuteNonQuery();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            finally
            {
                conn.Close();
            }
        }
    }
}
