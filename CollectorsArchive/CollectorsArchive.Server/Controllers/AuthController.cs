using CollectorsArchive.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CollectorsArchive.Server.Service;
using Google.Apis.Auth;

namespace CollectorsArchive.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDatabaseContents _db;
        private readonly IEmailService _emailService;

        public AuthController(AppDatabaseContents db, IEmailService emailService)
        {
            _db = db;
            _emailService = emailService;
        }

        // This model is used for Google-based login (frontend sends GoogleIDToken)
        public class GoogleAuthRequest
        {
            public string GoogleIDToken { get; set; } = string.Empty;
        }

        [HttpPost("LoginUsingGoogle")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.GoogleIDToken))
                    return BadRequest(new { message = "Missing Google ID token" });

                // Validate Google ID token against my real client ID
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new List<string>
                    {
                        "887271318818-l8omtrnmumbkr0tc4ssu031qkbii4t8i.apps.googleusercontent.com"
                    }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(request.GoogleIDToken, settings);

                var email = payload.Email;
                var googleSubject = payload.Subject;
                var userName = email.Split('@')[0];

                // Check if user exists and i am checking with their email
                // cus if user has non google email they still should be the same account
                var user = await _db.UserInformation
                    .FirstOrDefaultAsync(u => u.Email == email);

                // If user does NOT exist → auto-register
                if (user == null)
                {
                    user = new UserInformation
                    {
                        Email = email,
                        UserName = userName,
                        GoogleSubject = googleSubject
                    };

                    _db.UserInformation.Add(user);
                    await _db.SaveChangesAsync();
                }
                else
                {
                    // If user exists but GoogleSubject is null (they were non-Google before),
                    // then I will attach their GoogleSubject now so next time it's linked.
                    if (string.IsNullOrEmpty(user.GoogleSubject))
                    {
                        user.GoogleSubject = googleSubject;
                        await _db.SaveChangesAsync();
                    }
                }

                // Return login success
                return Ok(new
                {
                    message = "Login successful.",
                    userId = user.UserId,
                    email = user.Email,
                    userName = user.UserName
                });
            }
            catch (Exception ex)
            {
                // I want to see the real error while developing
                return StatusCode(500, new { message = "Google login failed.", error = ex.Message });
            }
        }

        [HttpPost("RequestForTempCode")]
        public async Task<IActionResult> RequestTempCode([FromBody] TempCodeRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email is required");

            // Before generating code, I will make sure user exists in the database
            var user = await _db.UserInformation
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            // If user is not in the database, I will create them as non-Google user
            if (user == null)
            {
                user = new UserInformation
                {
                    Email = request.Email,
                    // I am parsing username from email so I don't need a separate username input
                    UserName = request.Email.Split('@')[0],
                    GoogleSubject = null
                };

                _db.UserInformation.Add(user);
                await _db.SaveChangesAsync();
            }

            // this will generate 6-digit code when every time users request it 
            var code = new Random().Next(100000, 999999).ToString();

            // this will save the code in our database but im not sure if we actually need to save every generated code. 
            var tempCode = new TempLoginCode
            {
                Email = request.Email,
                Code = code,
                Expiration = DateTime.UtcNow.AddMinutes(10)
            };

            _db.TempLoginCodes.Add(tempCode);
            await _db.SaveChangesAsync();

            // Send email , im sending an email by plugin the email servive the class i create that send email 
            await _emailService.SendAsync(
                request.Email,
                "This is your Collector's Archive Login Code",
                $"Your login code is: {code} This code will expire with in 10 minutes from the time you recieved this email"
            );

            return Ok(new { message = "Temporary login code sent" });
        }

        [HttpPost("VerfyingTemporaryCode")]
        public async Task<IActionResult> VerifyTempCode([FromBody] TempCodeVerifyRequest request)
        {
            var record = await _db.TempLoginCodes
                .FirstOrDefaultAsync(x => x.Email == request.Email && x.Code == request.Code);

            if (record == null || record.Expiration < DateTime.UtcNow)
                return BadRequest(new { message = "Invalid or expired code" });

            // b4 i regester the user i will check if the user is in the database or not because if the user is in the database then i dont need to create them again
            var user = await _db.UserInformation
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            // here i am creating user if the user is not in the database because
            // i want to make sure that every user that login with email and code will be in the database
            if (user == null)
            {
                user = new UserInformation
                {
                    Email = request.Email,
                    UserName = request.Email.Split('@')[0],
                    GoogleSubject = null
                };

                _db.UserInformation.Add(user);
                await _db.SaveChangesAsync();
            }

            // Remove used code
            _db.TempLoginCodes.Remove(record);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Login successful",
                userName = user.UserName,
                email = user.Email
            });
        }

        // I need to creating another endpoit when users gives me their non google email i will first search in the database and
        // then if the user is the db then i dont need to send them code again and again 
        // (I can add this later if I want to optimize the flow)
    }

    // not sure about this I will CHECKKKKK LATERRR 
}
