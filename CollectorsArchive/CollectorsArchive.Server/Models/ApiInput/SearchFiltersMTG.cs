/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        AdvancedSearchFiltersMTG.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the advanced filters for searching Magic the Gathering cards within the
 *                  database. Each of the attributes can contain multiple options or provided a 
 *                  range of values.
 */

namespace CollectorsArchive.Server.Models.ApiInput
{
    public class SearchFiltersMTG
    {
        public string[]? colours { get; set; }
        public string[]? superTypes { get; set; }
        public string[]? types { get; set; }
        public string[]? subTypes { get; set; }
    }
}
