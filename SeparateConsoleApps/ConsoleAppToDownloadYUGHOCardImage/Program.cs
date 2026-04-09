/* ===============================================================================================================================  */
/* FILE             : Program.cs                                                                                                    */
/* PROJECT          : SeparateConsoleApps - YGO Card Downloader                                                                     */
/* NAMESPACE        : YGOCardDownloader                                                                                             */
/* PROGRAMMER       : Ermiyas  Gulti                                                                                                */
/* FIRST VERSION    : 2026-04-07                                                                                                    */
/* DESCRIPTION      : This console application downloads all Yu-Gi-Oh card images from the YGOPRODeck API.                          */
/*                    It retrieves card metadata, extracts the primary image URL for each card, and saves the images locally        */
/*                    using the card ID as the filename. The program ensures the output directory exists and provides progress      */
/*                    updates for each downloaded card.                                                                             */
/* ===============================================================================================================================  */



using System.Net.Http.Json;
using System.Text.Json;


/*
 * NAMESPACE    : YGOCardDownloader
 * DESCRIPTION  : Contains the data models used to deserialize Yu-Gi-Oh card information from 
 *                the YGOPRODeck API, along with the Program class responsible for downloading 
 *                and saving card images to the local filesystem.
 */
public class YGOCardImage
{
    public int id { get; set; }
    public string image_url { get; set; }
}


/*
 * CLASS        : YGOCard
 * DESCRIPTION  : Represents a Yu-Gi-Oh card with properties for its ID, name, type, description, 
 *                and a list of associated images. This class is used to deserialize card data 
 *                retrieved from the YGOPRODeck API.
 */
public class YGOCard
{
    public int id { get; set; }
    public string name { get; set; }
    public string type { get; set; }
    public string desc { get; set; }
    public List<YGOCardImage> card_images { get; set; }
}


/*
 * CLASS        : YGOResponse
 * DESCRIPTION  : Represents the structure of the response received from the YGOPRODeck API when 
 *                requesting card information. It contains a list of YGOCard objects under the 
 *                'data' property, which holds the details of each card retrieved from the API.
 */
public class YGOResponse
{
    public List<YGOCard> data { get; set; }
}


/*
 * CLASS        : Program
 * DESCRIPTION  : The main entry point of the console application responsible for downloading Yu-Gi-Oh card images. 
 *                It uses HttpClient to fetch card data from the YGOPRODeck API, processes the response to extract 
 *                image URLs, and saves the images locally in a designated directory. The program provides 
 *                feedback on the download progress and ensures that the output directory exists before saving files.
 */
class Program
{

    /*
     * METHOD       : Main
     * DESCRIPTION  : Asynchronously downloads all Yu-Gi-Oh card images from the YGOPRODeck API. It retrieves card metadata, 
     *                extracts the primary image URL for each card, and saves the images locally using the card ID as the filename. 
     *                The method ensures the output directory exists and provides progress updates for each downloaded card.
     * PARAMETERS   : None
     * RETURN VALUE : Task - Represents the asynchronous operation of downloading and saving card images.
     */
    static async Task Main()
    {
        var http = new HttpClient();

        Console.WriteLine("Downloading all Yu-Gi-Oh cards...");

        var response = await http.GetFromJsonAsync<YGOResponse>(
            "https://db.ygoprodeck.com/api/v7/cardinfo.php"
        );

        Directory.CreateDirectory("ygo_images");

        foreach (var card in response.data)
        {
            var imgUrl = card.card_images[0].image_url;
            var imgBytes = await http.GetByteArrayAsync(imgUrl);

            var filePath = $"ygo_images/{card.id}.jpg";
            await File.WriteAllBytesAsync(filePath, imgBytes);

            Console.WriteLine($"Saved {card.name} ({card.id})");
        }

        Console.WriteLine("Done!");
    }
}
