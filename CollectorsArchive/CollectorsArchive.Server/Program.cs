using CollectorsArchive.Server;
using CollectorsArchive.Server.Models;
using CollectorsArchive.Server.Service;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// this is my local host name and pc name urs might be different if u go through an issue (FROM ERMI)
// UPDATED FOR DEPLOYMENT: allow ONLY the Azure backend domain
builder.Services.AddHostFiltering(options =>
{
    options.AllowedHosts = new[]
    {
        //"collectorsarchive.azurewebsites.net"
        "localhost"
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
    options.AddPolicy("AllowAll", policy =>
    {
        //policy.WithOrigins("https://calm-meadow-02809691e.6.azurestaticapps.net")
        policy.WithOrigins("https://localhost:5173")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

var app = builder.Build();

// GOOGLE POPUP ISSUE for the cor headerr 
app.Use(async (context, next) =>
{
    context.Response.Headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups";
    context.Response.Headers["Cross-Origin-Embedder-Policy"] = "unsafe-none";
    await next();
});

// ENABLE SWAGGER IN PRODUCTION
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseHostFiltering();

app.UseRouting();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

// this is where the application starts listening for incoming HTTP requests
app.Run();