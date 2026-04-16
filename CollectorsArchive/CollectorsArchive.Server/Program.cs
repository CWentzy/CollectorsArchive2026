using CollectorsArchive.Server;
using CollectorsArchive.Server.Models;
using CollectorsArchive.Server.Service;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHostFiltering(options =>
{
    options.AllowedHosts = new[]
    {
        "collectorsarchive2026.onrender.com",
        "stalwart-eclair-4e4f65.netlify.app"
    };
});

builder.Services.Configure<CollectorArchiveEmailSettings>(
    builder.Configuration.GetSection("CollectorArchiveEmailSettings"));

builder.Services.AddDbContext<AppDatabaseContents>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ErmiyasDb")));

builder.Services.AddScoped<IEmailService, EmailConfirmationService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://stalwart-eclair-4e4f65.netlify.app")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseHostFiltering();

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseRouting();

app.UseAuthorization();

app.MapControllers();

app.Run();
