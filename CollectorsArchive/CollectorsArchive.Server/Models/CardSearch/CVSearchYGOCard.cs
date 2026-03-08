/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        CVSearchPrinting.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the serialized information from the Computer Vision system for searching
 *                  for a specific card printing.
 */

namespace CollectorsArchive.Server.Models.CardSearch
{
    public class CVSearchYGOPrinting
    {
        public string? cardName { get; set; }
        public string? cardID { get; set; }
        public string? setIndex { get; set; }
    }
}

