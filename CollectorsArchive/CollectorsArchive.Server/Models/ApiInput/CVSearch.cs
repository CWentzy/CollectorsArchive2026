/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        CVSearchPrinting.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the serialized information from the Computer Vision system for searching
 *                  for a specific card printing.
 */

namespace CollectorsArchive.Server.Models.ApiInput
{

    // ---------------------------------------- YU-GI-OH --------------------------------------- //

    public class CVSearchYGO
    {
        // More values can be added when scans more often provide accurate values

        public string? cardID { get; set; }
    }


    // ---------------------------------- MAGIC THE GATHERING ---------------------------------- //

    public class CVSearchMTG
    {
        public string? cardName { get; set; }
    }


}

