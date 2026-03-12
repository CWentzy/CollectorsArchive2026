using CollectorsArchive.Server.Service;
using CollectorsArchive.Server.Settings;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace CollectorsArchive.Server
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            // this is my local host name and pc name urs might be different if u go through an issue (FROM ERMI)
            // UPDATED FOR DEPLOYMENT: allow ONLY the Azure backend domain
            services.AddHostFiltering(options =>
            {
                options.AllowedHosts = new[]
                {
                    "collectorsarchive.azurewebsites.net" 
                };
            });

            services.Configure<CollectorArchiveEmailSettings>(
                Configuration.GetSection("CollectorArchiveEmailSettings"));

            services.AddDbContext<AppDatabaseContents>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("ErmiyasDb")));

            services.AddScoped<IEmailService, EmailConfirmationService>();

            services.AddControllers();
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", builder =>
                {
                    builder.WithOrigins("https://calm-meadow-02809691e.6.azurestaticapps.net")
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });
            });

        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // ENABLE SWAGGER IN PRODUCTION
            app.UseSwagger();
            app.UseSwaggerUI();

            //GOOGLE POPUP ISSUE (COOP header)
            app.Use(async (context, next) =>
            {
                context.Response.Headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups";
                await next();
            });

            app.UseHttpsRedirection();
            app.UseHostFiltering();

            app.UseRouting();

            app.UseCors("AllowAll");

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
