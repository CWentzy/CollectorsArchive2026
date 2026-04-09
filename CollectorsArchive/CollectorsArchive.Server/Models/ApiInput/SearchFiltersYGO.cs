/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        AdvancedSearchFiltersYGO.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the advanced filters for searching YuGiOh cards within the database.
 *                  Each of the attributes can contain multiple options or provided a range of
 *                  values.
 */

namespace CollectorsArchive.Server.Models.ApiInput
{
    public class SearchFiltersYGO
    {
        public string? superType { get; set; }
        public string[]? subTypes { get; set; }
        public string[]? attributes { get; set; }

        public string? classificationsOperator { get; set; }
        public string[]? classifications { get; set; }
        public string[]? classificationsExcluded { get; set; }

        public int[]? levelRange { get; set; }
        public int[]? pendulumRange { get; set; }
        public int[]? attack { get; set; }
        public int[]? defense { get; set; }
    }
}
