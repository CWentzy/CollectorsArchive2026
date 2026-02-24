/*
 * PROGRAMMER:      Curtis Wentzlaff (7274749)
 * FILENAME:        API_YGOCardImage.cs
 * ASSIGNMENT:      PROG3221 - Capstone
 * DESCRIPTION:     Models the de-serialized card image data from the Yu-Gi-Oh API. Includes 
 *                  methods for downloading both the large and small images locally.
 */

using System.IO;
using System.Net;

namespace YGODataUtility
{
    public class API_YGOCardImage
    {

        private const string _folderLarge = "\\images\\large\\";
        private const string _folderSmall = "\\images\\small\\";

        public string image_url { get; set; }
        public string image_url_small { get; set; }


        /// <summary>
        /// Downloads the large and small ENGLISH card images locally to a folder in the current
        /// directory.
        /// </summary>
        /// <param name="imageID">ID string used for the local filename</param>
        public void RetrieveImages(string imageID)
        {
            WebClient webClient = new WebClient();
            webClient.DownloadFile(image_url, Directory.GetCurrentDirectory() + _folderLarge + imageID + ".jpg");
            webClient.DownloadFile(image_url_small, Directory.GetCurrentDirectory() + _folderSmall + imageID + ".jpg");
        }
    }
}
