/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        AdvancedSearchFiltersYGO.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the basic ouput from a search result to display in a list to the user.
 */

namespace CollectorsArchive.Server.Models.CardSearch
{
    public class SearchOutputCard
    {
        public required string CardID { get; set; }
        public required string CardName { get; set; }
        public SearchOutputPrinting? PrintInfo { get; set; }
    }
}
