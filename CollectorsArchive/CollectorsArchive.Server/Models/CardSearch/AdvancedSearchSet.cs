/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        AdvancedSearchSet.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the serialized information from the user input for Card Set searching.
 *                  Used for displaying all cards printed within a specified Set.
 */

namespace CollectorsArchive.Server.Models.CardSearch
{
    public class AdvancedSearchSet
    {
        public int GameID { get; set; }
        public string? Name { get; set; }
    }
}
