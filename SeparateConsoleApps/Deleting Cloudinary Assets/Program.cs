/* ===============================================================================================================================  */
/* FILE             : Program.cs                                                                                                    */
/* PROJECT          : SeparateConsoleApps - CloudinaryDeleteAllCards                                                                */
/* NAMESPACE        : CloudinaryDeleteAllCards                                                                                      */
/* PROGRAMMER       : Ermiyas  Gulti                                                                                                */
/* FIRST VERSION    : 2026-04-07                                                                                                    */
/* DESCRIPTION      : This console application deletes all Yu-Gi-Oh card images stored in Cloudinary under the "cards/" prefix.     */
/*                    It loads Cloudinary credentials from appsettings.json, initializes the Cloudinary client, and iteratively     */
/*                    removes images in paginated batches using Cloudinary's deletion API.                                          */
/*                    The program tracks total deletions, handles cursor-based pagination, and outputs progress until all images    */
/*                    have been successfully removed.                                                                               */
/* ===============================================================================================================================  */



using System;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using System.IO;


/*
 * NAMESPACE    : CloudinaryDeleteAllCards
 * CLASS        : Program
 * DESCRIPTION  : This class contains the entry point for the console application responsible 
 *                for deleting all Yu‑Gi‑Oh card images stored in Cloudinary under the "cards/" 
 *                prefix. It loads Cloudinary credentials from appsettings.json, initializes 
 *                the Cloudinary client, and performs paginated batch deletions until all 
 *                matching resources have been removed.
 */
namespace CloudinaryDeleteAllCards
{

    /*
     * CLASS       : Program
     * DESCRIPTION  : The Program class contains the Main method, which serves as the entry point 
     *                for the console application. It orchestrates the loading of configuration, 
     *                initialization of the Cloudinary client, and the iterative deletion process 
     *                for all images stored under the "cards/" prefix in Cloudinary.
     */
    class Program
    {

        /*
         * METHOD       : Main
         * DESCRIPTION  : Entry point of the console application. This method loads Cloudinary 
         *                configuration values from appsettings.json, initializes the Cloudinary 
         *                client, and coordinates the full deletion process for all images stored 
         *                under the "cards/" prefix. It also handles output messaging and final 
         *                completion reporting.
         * PARAMETERS   : string[] args - Command-line arguments (not used in this application).
         * RETURN       : void
         */
        static void Main(string[] args)
        {
            // Load configuration from appsettings.json
            var config = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            // Initialize Cloudinary account
            var account = new Account(
                config["CloudinarySettings:CloudName"],
                config["CloudinarySettings:ApiKey"],
                config["CloudinarySettings:ApiSecret"]
            );

            var cloudinary = new Cloudinary(account);

            Console.WriteLine("Starting deletion of all 'cards/' images...");

            string nextCursor = null;
            int totalDeleted = 0;

            do
            {
                var deleteParams = new DelResParams
                {
                    Prefix = "cards/",
                    ResourceType = ResourceType.Image,
                    Type = "upload",
                    NextCursor = nextCursor
                };

                var result = cloudinary.DeleteResources(deleteParams);

                // Count deleted items in this batch
                int deletedCount = result.Deleted.Count;
                totalDeleted += deletedCount;

                Console.WriteLine($"Deleted batch: {deletedCount} images");

                // Set the next cursor for pagination
                nextCursor = result.NextCursor;

            } while (!string.IsNullOrEmpty(nextCursor));

            Console.WriteLine($"Deletion complete! Total images deleted: {totalDeleted}");
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }
    }
}