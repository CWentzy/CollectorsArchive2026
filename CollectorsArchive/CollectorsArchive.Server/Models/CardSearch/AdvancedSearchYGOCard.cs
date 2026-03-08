/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        AdvancedSearchCard.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the serialized information from the user input for YuGiOh card 
 *                  searching. Used for searching YuGiOh cards with game and card specific 
 *                  attributes.
 */

namespace CollectorsArchive.Server.Models.CardSearch
{
    public class AdvancedSearchInputYGOCard
    {
        public string? cardName { get; set; }
        public string? cardSuperType { get; set; }
        public string? cardSubType { get; set; }
        public string? attributes { get; set; }
        public string? cardTypesOperator { get; set; }
        public string[]? classifications { get; set; }
        public string[]? excludedClassifications { get; set; }
        public int[]? levelRange { get; set; }
        public int? minATK { get; set; }
        public int? maxATK { get; set; }
        public int? minDEF { get; set; }
        public int? maxDEF { get; set; }
    }
}
