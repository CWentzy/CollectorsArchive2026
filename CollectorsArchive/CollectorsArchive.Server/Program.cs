using CollectorsArchive.Server;

using IEmailService = CollectorsArchive.Server.Service.IEmailService;

var builder = WebApplication.CreateBuilder(args);

// i created a startup class to handle the configuration of services and the HTTP request pipeline,
// so here i am calling the constructor of the Startup class and passing the configuration from the builder to it,
// so that we can use it in the ConfigureServices method to register our services and in the Configure method to configure the HTTP request pipeline.
var startup = new Startup(builder.Configuration);

// Register services
startup.ConfigureServices(builder.Services);

var app = builder.Build();

// this is where we will configure the HTTP request pipeline, we will use the Configure method from the Startup class to do that.
startup.Configure(app, app.Environment);

app.Run();
