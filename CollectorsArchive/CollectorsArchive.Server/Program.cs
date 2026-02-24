using CollectorsArchive.Server;

var builder = WebApplication.CreateBuilder(args);

// Use Startup.cs
var startup = new Startup(builder.Configuration);

// Register services
startup.ConfigureServices(builder.Services);

var app = builder.Build();

// Configure middleware pipeline
startup.Configure(app, app.Environment);

app.Run();
