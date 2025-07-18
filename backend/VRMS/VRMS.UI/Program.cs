using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using VRMS.Application.Interface;
using VRMS.Application.Services;
using VRMS.Domain.Infra.Interfaces;
using VRMS.Infrastructure.Data;
using VRMS.Infrastructure.Repositories;
using VRMS.UI.Middleware;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using VRMS.Api.Services;
using Stripe;
using StripeCustomerService = Stripe.CustomerService;
using AppCustomerService = VRMS.Application.Services.CustomerService;
using AppPriceService = VRMS.Application.Services.PriceService;
using backend.VRMS.Services;

//using backend.VRMS.Services;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from the .env file.
string currentDir = Directory.GetCurrentDirectory();
string envFilePath = Path.Combine(currentDir, "..", ".env");
if (System.IO.File.Exists(envFilePath))
{
    Env.Load(envFilePath);
}
else
{
    Console.WriteLine($".env file not found at {envFilePath}");
}

// Retrieve the secret to be used for authentication.
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");
if (string.IsNullOrWhiteSpace(jwtSecret))
{
    throw new Exception("JWT_SECRET environment variable is null or empty!");
}
else
{

}
QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
// ✅ Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174") // Allow requests from both frontend URLs
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ✅ Add Database Connection for SQL Server (VRMSDbContext)
builder.Services.AddDbContext<VRMSDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ✅ Add MongoDbSettings to DI for MongoDB configuration
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));

// ✅ Register MongoDB client (Singleton)
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return new MongoClient(settings.ConnectionString);  // MongoDB connection string from settings
});
// ✅ Configure Authentication using JWT Bearer
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.Zero
    };
});

//tabelat ne SQL
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<ICustomerService, AppCustomerService>();

builder.Services.AddScoped<IAgentRepository, AgentRepository>();
builder.Services.AddScoped<IAgentService, AgentService>();

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

builder.Services.AddScoped<IReceiptRepository, ReceiptRepository>();
builder.Services.AddScoped<IReceiptService, ReceiptService>();

builder.Services.AddScoped<ICarRepository, CarRepository>();
builder.Services.AddScoped<ICarService, CarService>();
builder.Services.AddScoped<IMotorcycleRepository, MotorcycleRepository>();
builder.Services.AddScoped<IMotorcycleService, MotorcycleService>();
builder.Services.AddScoped<IBusRepository, BusRepository>();
builder.Services.AddScoped<IBusService, BusService>();
builder.Services.AddScoped<ITruckRepository, TruckRepository>();
builder.Services.AddScoped<ITruckService, TruckService>();

builder.Services.AddScoped<ITripDetailsRepository, TripDetailsRepository>();
builder.Services.AddScoped<ITripDetailsService, TripDetailsService>();

builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
builder.Services.AddScoped<IVehicleService, VehicleService>();


builder.Services.AddScoped<IPhotoService, PhotoService>();

builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
builder.Services.AddScoped<IReservationService, ReservationService>();

builder.Services.AddScoped<IInsurancePolicyRepository, InsurancePolicyRepository>();
builder.Services.AddScoped<IInsurancePolicyService, InsurancePolicyService>();

//services qe jon automatike
builder.Services.AddHostedService<PaymentCleanupService>();
builder.Services.AddHostedService<FinalPaymentCleanupService>();
//builder.Services.AddHostedService<VehicleAvailabilityBackgroundService>();
//builder.Services.AddHostedService<VehicleAvailabilityStartupService>();
builder.Services.AddScoped<AppPriceService>();
builder.Services.AddHostedService<ConflictCheckerService>();



//per httponly tokena
builder.Services.AddHttpContextAccessor();
//tabelat ne Mongo
builder.Services.AddScoped<IVehicleHistoryRepository, VehicleHistoryRepository>();
builder.Services.AddScoped<IVehicleHistoryService, VehicleHistoryService>();

builder.Services.AddScoped<IVehiclePreConditionRepository, VehiclePreConditionRepository>();
builder.Services.AddScoped<IVehiclePreConditionService, VehiclePreConditionService>();

builder.Services.AddScoped<IVehiclePostConditionRepository, VehiclePostConditionRepository>();
builder.Services.AddScoped<IVehiclePostConditionService, VehiclePostConditionService>();

builder.Services.AddScoped<IVehicleRatingRepository, VehicleRatingRepository>();
builder.Services.AddScoped<IVehicleRatingService, VehicleRatingService>();

builder.Services.AddScoped<EmailTemplate>();

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

builder.Services.AddHostedService<GpsSimulationService>();


// ✅ Configure Swagger with JWT Authentication support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "VRMS API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' followed by a space and your token.\n\nExample: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ✅ Add Controllers (to handle API endpoints)
builder.Services.AddControllers().AddJsonOptions(options =>
{
    //options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
});

// ✅ Add Swagger for API documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.CustomSchemaIds(type => type.ToString());
});

var stripeKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");
if (string.IsNullOrWhiteSpace(stripeKey))
    throw new Exception("❌ STRIPE_SECRET_KEY environment variable is not set.");
else
{
    StripeConfiguration.ApiKey = stripeKey;
}

var app = builder.Build();
// Add Authentication before Authorization
app.UseAuthentication();

app.UseAuthorization();

// ✅ Enable CORS
app.UseCors("AllowFrontend");

// Redirect root to Swagger UI as middleware instead of MapGet
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/")
    {
        context.Response.Redirect("/swagger/index.html");
        return;
    }
    await next.Invoke();
});
//app.MapGet("/mongo/check-connection", async (IMongoClient mongoClient, IOptions<MongoDbSettings> settings) =>
//{
//    try
//    {
//        var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
//        var collections = await database.ListCollectionNames().ToListAsync();
//        return Results.Ok(new { message = "MongoDB connection successful", collections });
//    }
//    catch (Exception ex)
//    {
//        return Results.Problem($"MongoDB connection failed: {ex.Message}");
//    }
//});

// ✅ Swagger setup for development environment
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionMiddleware>();

// ✅ Enable HTTPS and Authorization (optional for production)
app.UseHttpsRedirection();
app.UseAuthorization();

// ✅ Map controllers to handle HTTP requests
app.MapControllers();

// ✅ Run the application
app.Run();
