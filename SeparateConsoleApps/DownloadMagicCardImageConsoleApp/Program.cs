/* ========================================================================================================== */
/* FILE        : Program.cs                                                                                   */
/* PROJECT     : DownloadMagicCardImageConsoleApp                                                             */
/* PROGRAMMER  : Ermiyas Gulti                                                                                */
/* DATE        : 2026-04-08                                                                                   */
/* DESCRIPTION : Loads a local Scryfall JSON file, extracts card image URLs, downloads the images,            */
/*               and saves them to the "mtg_images" folder. Cards without images are skipped, and             */
/*               file names are cleaned to avoid invalid characters.                                          */
/* ========================================================================================================== */


using System.Text.Json;


/*
 * CLASS: ImageUris
 * DESCRIPTION: Represents the image URIs for a Magic: The Gathering card, specifically the "normal" size image.
 */
public class ImageUris
{
    public string normal { get; set; }
}


/*
 * CLASS: ScryfallCard
 * DESCRIPTION: Represents a Magic: The Gathering card with its name and associated image URIs.
 */
public class ScryfallCard
{
    public string name { get; set; }
    public ImageUris image_uris { get; set; }
}


/*
 * CLASS: Program
 * DESCRIPTION: Main entry point of the application that loads a local Scryfall JSON file, extracts card image URLs, 
 *              downloads the images, and saves them to the "mtg_images" folder. Cards without images are skipped, 
 *              and file names are cleaned to avoid invalid characters.
 */
class Program
{

    /*
     * METHOD: Main
     * DESCRIPTION: Asynchronously loads a local Scryfall JSON file, deserializes it into a list of ScryfallCard objects,
     *              downloads the card images, and saves them to the "mtg_images" folder. Cards without images are skipped,
     *              and file names are cleaned to avoid invalid characters.
     * PARAMETERS: None
     * RETURN VALUE: Task (asynchronous method)static void Main(string[] args)
     */
    static async Task Main()
    {
        Console.WriteLine("Loading local Scryfall JSON...");

        // the json file i got it from scryfall api and i saved it in my local storage and i am using that json file to download the images of the cards
        string jsonPath = @"C:\3 year 2nd Sem Files\DownloadMagicCardImageConsoleApp\bin\Debug\net8.0\oracle-cards-20260407090301.json";

        string json = await File.ReadAllTextAsync(jsonPath);

        // this option allows the deserializer to ignore case when matching JSON properties to C# properties,
        // so it will work even if the JSON uses different casing (e.g., "Name" vs "name").
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var cards = JsonSerializer.Deserialize<List<ScryfallCard>>(json, options);

        if (cards == null)
        {
            Console.WriteLine("Failed to parse JSON.");
            return;
        }

        Directory.CreateDirectory("mtg_images");
        var http = new HttpClient();

        foreach (var card in cards)
        {
            try
            {
                // so some cards don't have images, so we need to check if the image_uris property is null before trying to access it.
                // if it's null, we skip that card and move on to the next one.
                if (card.image_uris == null || card.image_uris.normal == null)
                {
                    Console.WriteLine($"Skipping {card.name}: no image.");
                    continue;
                }

                string imgUrl = card.image_uris.normal;
                byte[] imgBytes = await http.GetByteArrayAsync(imgUrl);

                // Remove ONLY illegal filename characters magic cards has un allowed chars like & so on so i need to remove those chars from the card name before saving the image,
                // otherwise it will throw an exception.
                char[] illegal = Path.GetInvalidFileNameChars();
                string safeName = new string(card.name.Where(c => !illegal.Contains(c)).ToArray());

                // Save EXACT card name
                string filePath = Path.Combine("mtg_images", $"{safeName}.jpg");

                await File.WriteAllBytesAsync(filePath, imgBytes);

                Console.WriteLine($"Saved {card.name}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to download {card.name}: {ex.Message}");
            }
        }

        Console.WriteLine("Done!");
    }
}
