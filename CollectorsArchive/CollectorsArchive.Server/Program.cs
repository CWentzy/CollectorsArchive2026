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
        "collectorsarchive2026.onrender.com"
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
        policy.WithOrigins("https://stalwart-eclair-4e4f65.netlify.app")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

var app = builder.Build();

app.Use(async (context, next) =>
{
    context.Response.Headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups";
    context.Response.Headers["Cross-Origin-Embedder-Policy"] = "unsafe-none";
    await next();
});

app.UseSwagger();
app.UseSwaggerUI();

//app.UseHttpsRedirection();
//app.UseHostFiltering();

//app.UseRouting();

//app.UseCors("AllowAll");

//app.UseAuthorization();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseHostFiltering();

app.UseRouting();

app.UseAuthorization();

app.MapControllers();

app.Run();