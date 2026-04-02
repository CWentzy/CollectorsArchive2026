/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        SearchOutputResult.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the basic ouput from a search result to display in a list to the user.
 */

using CollectorsArchive.Server.Models.ApiOutput;

namespace CollectorsArchive.Server.Models.CardSearch
{
    public class SearchOutputResult
    {
        public required List<CardInformation> Cards { get; set; }
        public List<PrintingInformation> Printings { get; set; } = [];
    }
}
