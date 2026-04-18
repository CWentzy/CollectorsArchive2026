/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        PrintingInformation.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the information returned to the client after a search through the card
 *                  printing table.
 */

namespace CollectorsArchive.Server.Models.ApiOutput
{
    public class PrintingInformation
    {
        public required int GameID { get; set; }

        // Redundant Card Information
        public string? CardID { get; set; }
        public string? CardName { get; set; }

        public required int PrintID { get; set; }
        public required int CardSetID { get; set; }
        public required string SetName { get; set; }
        public required string SetCode { get; set; }    // SetCode + SetIndex
        public required string Rarity { get; set; }
        public required DateTime ReleaseDate { get; set; }

        // Information about a specific user 
        // this is just for git action to re build the new deployed version of the website url 
        public int? UserID { get; set; }
        public int? Quantity { get; set; }
    }
}
