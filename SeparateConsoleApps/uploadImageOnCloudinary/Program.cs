/* ===============================================================================================================================  */
/* FILE             : Program.cs                                                                                                    */
/* PROJECT          : SeparateConsoleApps - YGO Image Uploader                                                                      */
/* NAMESPACE        : uploadImageOnCloudinary                                                                                       */
/* PROGRAMMER       : Ermiyas Gulti                                                                                                 */
/* FIRST VERSION    : 2026-04-07                                                                                                    */
/* DESCRIPTION      : This console application uploads Yu-Gi-Oh card images to Cloudinary.                                          */
/*                    It loads Cloudinary credentials from appsettings.json, scans the local ygo_images folder,                     */
/*                    and uploads each image using controlled concurrency to avoid API overload.                                    */
/*                    Each file is uploaded using its cardId as the public identifier, overwriting existing images                  */
/*                    to maintain a clean and consistent Cloudinary storage structure.                                               */
/* ===============================================================================================================================  */



using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;

// Load configuration from appsettings.json
var config = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .Build();

// Create ImageService instance
var imageService = new ImageService(config);

// Folder where local images live
var imagesFolder = Path.Combine(Directory.GetCurrentDirectory(), "ygo_images");

// Get all image files
var files = Directory.GetFiles(imagesFolder, "*.jpg");

// Control how many uploads happen at the same time  this is important to avoid overwhelming the Cloudinary
// API and to manage the system resources.  
int maxConcurrency = 5;
using var semaphore = new SemaphoreSlim(maxConcurrency);

// This will trrack the total number of files, successful uploads, and failed uploads.
int total = files.Length;
int success = 0;
int failed = 0;

var tasks = files.Select(async (file, index) =>
{
    await semaphore.WaitAsync();

    try
    {
        var cardId = Path.GetFileNameWithoutExtension(file);

        var url = await imageService.UploadCardImageAsync(file, cardId);

        Interlocked.Increment(ref success);
        Console.WriteLine($"[{index + 1}/{total}] Uploaded: {cardId}");
    }
    catch (Exception ex)
    {
        Interlocked.Increment(ref failed);
        Console.WriteLine($"[{index + 1}/{total}] Failed: {file} | Error: {ex.Message}");
    }
    finally
    {
        semaphore.Release();
    }
});

await Task.WhenAll(tasks);

Console.WriteLine($"DONE -> SUCCESS: {success}, FAILED BROOO ! {failed}");


/*
 * CLASS        : ImageService
 * NAMESPACE    : YgoImageUploader
 * DESCRIPTION  : This class handles all Cloudinary image‑upload operations for the Yu‑Gi‑Oh 
 *                card uploader console application. It loads Cloudinary credentials from 
 *                the application configuration, prepares upload parameters, and uploads 
 *                images using the cardId as the public identifier. The class also ensures 
 *                consistent naming, overwriting behavior, and secure URL retrieval.
 */
public class ImageService
{

    /*
     * FIELD        : _cloudinary
     * DESCRIPTION  : Holds the Cloudinary client instance used for uploading images. 
     *                It is initialized through the constructor using credentials loaded 
     *                from the application configuration. This field provides the core 
     *                connection required for all Cloudinary upload operations.
     */
    private readonly Cloudinary _cloudinary;


    /*
     * CONSTRUCTOR  : ImageService
     * DESCRIPTION  : Initializes the ImageService by creating a Cloudinary client instance using the provided configuration.public ImageService(Cloudinary cloudinary)
     * PARAMETERS   : IConfiguration config - The application configuration object that contains Cloudinary credentials.
     * RETURNS      : None
     * EXCEPTIONS   : Throws an exception if Cloudinary credentials are missing or invalid.
     */
    public ImageService(IConfiguration config)
    {
        // Cloudinary credentials are stored in appsettings.json
        // and loaded through IConfiguration in Program.cs
        var account = new Account(
            config["CloudinarySettings:CloudName"],
            config["CloudinarySettings:ApiKey"],
            config["CloudinarySettings:ApiSecret"]
        );

        _cloudinary = new Cloudinary(account);
    }


    /*
     * METHOD       : UploadCardImageAsync
     * DESCRIPTION  : Uploads a single Yu‑Gi‑Oh card image to Cloudinary. The method validates 
     *                the file path, opens a read stream, configures upload parameters such as 
     *                filename behavior, folder structure, and overwrite rules, and returns the 
     *                secure Cloudinary URL upon successful upload.
     */
    public async Task<string> UploadCardImageAsync(string filePath, string cardId)
    {
        if (!File.Exists(filePath))
            throw new Exception("File does not exist");

        using var stream = File.OpenRead(filePath);

        var uploadParams = new ImageUploadParams()
        {
            File = new FileDescription(filePath, stream),

            // Force Cloudinary to keep my  filename bcos i use the cardId as the filename, which is unique for each card and 
            // since i use the same cardID in my database, it makes it easier to manage and retrieve the image when needed without having to store the URL in the database.
            UseFilename = true,
            UniqueFilename = false,

            // We assign a specific folder "cards" and name the file the cardId
            PublicId = $"ygo_images/{cardId}",

            // If i upload a new image for the same cardId, i want to overwrite the existing image in Cloudinary,
            // so that i don't have multiple images for the same card and also to save storage space in Cloudinary.
            Overwrite = true
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
        {
            return uploadResult.SecureUrl.ToString();

            // no need  to save this URL to our DB, 
        }

        throw new Exception($"Upload failed: {uploadResult.Error?.Message}");
    }
}