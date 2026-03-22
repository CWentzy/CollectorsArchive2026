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

        public required string PrintID { get; set; }
        public required string SetID { get; set; }
        public required string SetName { get; set; }
        public required string SetCode { get; set; }    // SetCode + SetIndex
        public required string Rarity { get; set; }
        public required DateOnly ReleaseDate { get; set; }

        // Information about a specific user
        public int? UserID { get; set; }
        public int? Quantity { get; set; }
    }
}
