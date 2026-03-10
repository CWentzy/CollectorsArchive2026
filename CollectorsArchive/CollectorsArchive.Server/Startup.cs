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
            services.AddHostFiltering(options =>
            {
                options.AllowedHosts = new[] { "localhost", "127.0.0.1", "Ermiyas" };
            });

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

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", builder =>
                {
                    builder.WithOrigins("https://localhost:5173", "https://localhost:5174")
                        .AllowAnyMethod()
                        .AllowAnyHeader();
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

