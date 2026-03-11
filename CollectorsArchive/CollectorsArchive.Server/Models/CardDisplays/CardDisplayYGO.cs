/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        CardDisplayYGO.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the YuGiOh Card Information displayed when selecting the card from the
 *                  results list.
 */

namespace CollectorsArchive.Server.Models.CardDisplays
{
    public class CardDisplayYGO
    {
        public string name { get; set; }
        public string superType { get; set; }
        public string subType { get; set; }
        public string cardText { get; set; }
        public string? attribute { get; set; }
        public string[]? classifications { get; set; }
        public int? level { get; set; }
        public int? Atk { get; set; }
        public int? Def { get; set; }
    }
}
