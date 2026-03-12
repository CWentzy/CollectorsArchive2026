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
            services.AddHostFiltering(options =>
            {
                options.AllowedHosts = new[]
                {
                    "collectorsarchive.azurewebsites.net" // backend domain
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
                    var allowedOrigins = Configuration["AllowedOrigins"];

                    builder.WithOrigins(allowedOrigins)
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            
            app.UseSwagger();
            app.UseSwaggerUI();

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
