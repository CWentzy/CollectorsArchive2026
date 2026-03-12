using CollectorsArchive.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CollectorsArchive.Server.Service;


namespace CollectorsArchive.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDatabaseContents _db;
        IEmailService _emailService;

        public AuthController(AppDatabaseContents db, IEmailService emailService)
        {
            _db = db;
            _emailService = emailService;
        }


        [HttpPost("RegisterNewUser")]
        public async Task<IActionResult> Register([FromBody] GoogleAuthRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.GoogleSubject))
            {
                return BadRequest(new { message = "Email, Name, and Google Subject are required." });
            }

            // Check if user already exists by Google Subject or Email
            var existingUser = await _db.UserInformation
                .FirstOrDefaultAsync(u => u.UserName == request.Name || u.Email == request.Email);

            if (existingUser != null)
            {
                return Conflict(new { message = "A user with this email or Google account already exists." });
            }

            var newUser = new UserInformation
            {
                Email = request.Email,
                UserName = request.Name,
                GoogleSubject = request.GoogleSubject
            };

            _db.UserInformation.Add(newUser);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Registration successful.",
                userId = newUser.UserId,
                email = newUser.Email,
                userName = newUser.UserName
            });
        }


        [HttpPost("LoginUsingGoogle")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.GoogleSubject))
            {
                return BadRequest(new { message = "Google Subject is required." });
            }

            var user = await _db.UserInformation
                .FirstOrDefaultAsync(u => u.GoogleSubject == request.GoogleSubject);

            if (user == null)
            {
                return NotFound(new { message = "User not found. Please register first." });
            }

            return Ok(new
            {
                message = "Login successful.",
                userId = user.UserId,
                email = user.Email,
                userName = user.UserName
            });
        }

        [HttpPost("RequestForTempCode")]
        public async Task<IActionResult> RequestTempCode([FromBody] TempCodeRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email is required");

            //  this will generate 6-digit code when every time users request it 
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
    }

    // not sure about this I will CHECKKKKK LATERRR 
    public class GoogleAuthRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string GoogleSubject { get; set; } = string.Empty;
    }
}

