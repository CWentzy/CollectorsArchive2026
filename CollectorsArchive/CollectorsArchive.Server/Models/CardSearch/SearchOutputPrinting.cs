/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        AdvancedSearchFiltersYGO.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the additional output data from a search that includes information
 *                  about individual printings.
 */

namespace CollectorsArchive.Server.Models.CardSearch
{
    public class SearchOutputPrinting
    {
        public required int PrintID { get; set; }
        public required string SetCode { get; set; }
        public required string CardRarity { get; set; }
    }
}
