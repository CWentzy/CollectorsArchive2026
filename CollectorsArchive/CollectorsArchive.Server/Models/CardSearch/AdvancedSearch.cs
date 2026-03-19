/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        AdvancedSearch.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the basic information provided for a card database search. Includes
 *                  a undefined object field that represents the advanced parameters needed for
 *                  specialized searches within each different game. This object is cast into the
 *                  appropriate Filters object when needed.
 */

namespace CollectorsArchive.Server.Models.CardSearch
{
    public class AdvancedSearch
    {
        public required string query { get; set; }          // The name of the Card or Set
        public required string searchType { get; set; }
        public required string game { get; set; }


        // This object is cast into different filters depending on the game that is selected
        public required object advancedFilters { get; set; }
    }
}
