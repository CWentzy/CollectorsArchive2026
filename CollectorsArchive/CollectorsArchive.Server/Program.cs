using Microsoft.EntityFrameworkCore;
using CollectorsArchive.Server;

namespace CollectorsArchive.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddAuthorization();

            // ADD THIS TO REGISTER CONTROLLERS this does is it tells the application to look for controllers in the project and to use them to handle incoming requests.
            // Without this line the application will not be able to find the controllers and will
            // return a 404 error for any requests that are meant to be handled by a controller.
            builder.Services.AddControllers();

            // Register EF Core DbContext will be used to interact with the database. It is configured to use SQL Server and the connection string is retrieved
            // from the application's configuration settings.
            builder.Services.AddDbContext<AppDatabaseContents>(options =>
                options.UseSqlServer("Server=Ermiyas\\ERMIYASDBSERVER;Database=CollectorsArchive;Trusted_Connection=True;TrustServerCertificate=True;"));

            var app = builder.Build();

            app.UseDefaultFiles();

            if (app.Environment.IsDevelopment())
            {
            }

            app.UseHttpsRedirection();
            app.UseAuthorization();

            // ADD THIS
            app.MapControllers();

            var summaries = new[]
            {
                "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
            };

            app.MapGet("/weatherforecast", (HttpContext httpContext) =>
            {
                var forecast = Enumerable.Range(1, 5).Select(index =>
                    new WeatherForecast
                    {
                        Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                        TemperatureC = Random.Shared.Next(-20, 55),
                        Summary = summaries[Random.Shared.Next(summaries.Length)]
                    })
                    .ToArray();
                return forecast;
            })
            .WithName("GetWeatherForecast");

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}