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
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // here I am configuring the services that the application will use. This is where you register our application's dependencies,
        // like database contexts, authentication services, and any custom services that we will create.
        public void ConfigureServices(IServiceCollection services)
        {
            // Allow React to call this API
            services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", builder =>
                {
                    builder.WithOrigins("https://localhost:5173", "https://localhost:5174").AllowAnyHeader().AllowAnyMethod().AllowCredentials();
                });
            });

            // this will enable the application to use controllers to handle incoming HTTP requests.
            // It tells the application to look for controller classes in the project and to use them to handle requests that match the routes defined in those controllers.
            services.AddControllers();

            // here adding the AppDatabaseContents DbContext to the service collection.
            // This allows the application to use Entity Framework Core to interact with the database.
            // guys please make sure to add or replace my ErmiyasDb connection string in the appsettings.json wit ur own connection string u added in appsettings.json file.
            services.AddDbContext<AppDatabaseContents>(options => options.UseSqlServer(Configuration.GetConnectionString("ErmiyasDb")));
            services.AddAuthentication();
            //services.AddScoped<IUserService, UserService>(); 
        }

        // 2. Configure the HTTP request pipeline
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();

            // Enable CORS before endpoints
            app.UseCors("AllowReactApp");

            // maybe authentication if we need authentication in the future, but for now we will not use it since we are not implementing any authentication mechanism yet.
            // app.UseAuthentication();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
