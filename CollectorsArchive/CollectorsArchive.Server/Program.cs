using CollectorsArchive.Server;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace CollectorsArchive.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // JWT settings from appsettings.json
            var jwtSection = builder.Configuration.GetSection("Jwt");
            var jwtSecret = jwtSection["Secret"]!; // I generated it with: openssl rand -base64 32

            // Authentication: validate incoming JWTs issued by this server
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtSection["Issuer"],
                        ValidAudience = jwtSection["Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
                    };
                });

            builder.Services.AddAuthorization();
            builder.Services.AddControllers();

            // HttpClient used by AuthController to verify Google access tokens
            builder.Services.AddHttpClient();

            // EF Core — reads connection string from appsettings.json
            var connectionString = builder.Configuration.GetConnectionString("CollectorsArchiveDb");
            builder.Services.AddSqlServer<AppDatabaseContents>(connectionString);

            var app = builder.Build();

            app.UseDefaultFiles();

            if (app.Environment.IsDevelopment())
            {
            }

            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();

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