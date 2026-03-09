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
            // so this is important! 
            // this will be the email settings that we will use to send the email to the user for the email confirmation service,
            // we will get the values from the appsettings.json file and bind it to the CollectorArchiveEmailSettings class
            // that we created in the Settings folder, this will allow us to easily access the email settings in our email service class.
            services.Configure<CollectorArchiveEmailSettings>(
                Configuration.GetSection("CollectorArchiveEmailSettings"));

            // this line will be for registering the AppDatabaseContents class as a service,
            // and it will use the connection string from the appsetting json file to connect to the database,
            // this will allow us to easily access the database context in our controllers and services.
            services.AddDbContext<AppDatabaseContents>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("ErmiyasDb")));

            // Register the app email service 
            services.AddScoped<IEmailService, EmailConfirmationService>();

            services.AddControllers();
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();

            // CORS FIX — allow my Vite frontend to call my backend
            services.AddCors(options =>
            {
                options.AddPolicy("FrontendPolicy", builder =>
                {
                    builder
                        .WithOrigins("https://localhost:5173", "http://localhost:5173") // my frontend origin
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials(); // needed for auth cookies or headers
                });
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseRouting();

            app.UseCors("FrontendPolicy");   // CORS MUST be here

            app.UseHttpsRedirection();       // move this BELOW cors

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
