using CollectorsArchive.Server.Models;
using CollectorsArchive.Server.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


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


        [HttpPost("LoginUsingGoogle")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthRequest request)
        {
            // so before we used to have registeration page , we dont need that anymore cus we will authomatically register them if they are not registered to our database
            if (string.IsNullOrWhiteSpace(request.GoogleSubject))
                return BadRequest(new { message = "Google Subject is required." });

            // Try to find user by using their google subject from our db userprofile table 
            var user = await _db.UserProfile
                .FirstOrDefaultAsync(u => u.GoogleSubject == request.GoogleSubject);

            //  If user does NOT exist then we will auto-register
            if (user == null)
            {
                user = new UserProfile
                {
                    Email = request.Email,
                    UserName = request.Name,
                    GoogleSubject = request.GoogleSubject,
                    PhotoUrl = request.PhotoUrl,
                    JoinDate = DateTime.UtcNow
                };

                _db.UserProfile.Add(user);
                await _db.SaveChangesAsync();
            }
            else
            {
                // Update photo if changed
                if (!string.IsNullOrWhiteSpace(request.PhotoUrl) && user.PhotoUrl != request.PhotoUrl)
                {
                    user.PhotoUrl = request.PhotoUrl;
                    await _db.SaveChangesAsync();
                }
            }

            // then at the last i will return final user
            return Ok(new
            {
                message = "Login successful.",
                userId = user.UserId,
                email = user.Email,
                userName = user.UserName,
                photoUrl = user.PhotoUrl
            });
        }


        [HttpPost("ForNonGoogleNewUser")]
        public async Task<IActionResult> RegisterNonGoogleUser([FromBody] NonGoogleUserRequestModel request)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Code))
                return BadRequest(new { message = "Email and Code are required." });

            // Check if user already exists
            var existingUser = await _db.UserProfile
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (existingUser != null)
                return Conflict(new { message = "A user with this email already exists." });

            // Verify temp code
            var record = await _db.TempLoginCodes
                .FirstOrDefaultAsync(x => x.Email == request.Email && x.Code == request.Code);

            if (record == null)
                return BadRequest(new { message = "Invalid code." });

            if (record.Expiration < DateTime.UtcNow)
                return BadRequest(new { message = "Code expired." });

            // Create user
            var newUser = new UserProfile
            {
                Email = request.Email,
                UserName = string.IsNullOrWhiteSpace(request.Name)
                    ? request.Email.Split('@')[0]
                    : request.Name,
                GoogleSubject = null,
                JoinDate = DateTime.UtcNow
            };

            _db.UserProfile.Add(newUser);
            await _db.SaveChangesAsync();

            // Remove used code
            _db.TempLoginCodes.Remove(record);
            await _db.SaveChangesAsync();

            // Return user
            return Ok(new
            {
                message = "Registration successful",
                userId = newUser.UserId,
                email = newUser.Email,
                userName = newUser.UserName
            });
        }

        [HttpPost("RequestForTempCode")]
        public async Task<IActionResult> RequestTempCode([FromBody] TempCodeRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest(new { message = "Email is required" });

            try
            {
                var code = System.Security.Cryptography.RandomNumberGenerator.GetInt32(100000, 999999).ToString();
                var expiryTime = DateTime.UtcNow.AddMinutes(10);

                //  first i need to check if there is already a code for this email in the database, if there is then i will update it with the new code and expiration time,
                //  if there is not then i will create a new entry in the database with the email, code and expiration time
                var existingEntry = await _db.TempLoginCodes.FirstOrDefaultAsync(x => x.Email == request.Email);
                if (existingEntry != null)
                {
                    existingEntry.Code = code;
                    existingEntry.Expiration = expiryTime;
                    _db.TempLoginCodes.Update(existingEntry);
                }
                else
                {
                    _db.TempLoginCodes.Add(new TempLoginCode { Email = request.Email, Code = code, Expiration = expiryTime });
                }

                await _db.SaveChangesAsync();

                // then i will send the code to the user's email using my email service, if there is an error with sending the email (like gmail rejecting the connection) then i will catch that error and return
                // a 500 status code with a message to check the console for more details
                try
                {
                    await _emailService.SendAsync(request.Email, "Login Code", $"Your code is: {code}");
                }
                catch (Exception mailEx)
                {
                    // This will show up in your CMD/Output window if Gmail rejects the connection
                    Console.WriteLine($"GMAIL ERROR: {mailEx.Message}");
                    return StatusCode(500, new { message = "Email failed to send. Check console." });
                }

                return Ok(new { message = "Temporary login code sent" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server Error", error = ex.Message });
            }
        }






        [HttpPost("VerfyingTemporaryCode")]
        public async Task<IActionResult> VerifyTempCode([FromBody] TempCodeVerifyRequest request)
        {
            // Find the code
            var record = await _db.TempLoginCodes
                .FirstOrDefaultAsync(x => x.Email == request.Email && x.Code == request.Code);

            if (record == null)
                return BadRequest(new { message = "Invalid code." });

            if (record.Expiration < DateTime.UtcNow)
                return BadRequest(new { message = "Code expired." });

            // Check if user exists
            var user = await _db.UserProfile
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            // Auto-Register if they are new
            if (user == null)
            {
                user = new UserProfile
                {
                    Email = request.Email,
                    UserName = request.Email.Split('@')[0], // Default username from email
                    JoinDate = DateTime.UtcNow
                };

                _db.UserProfile.Add(user);
                await _db.SaveChangesAsync();
            }

            // Cleanup the used code
            _db.TempLoginCodes.Remove(record);
            await _db.SaveChangesAsync();

            // Return everything the frontend needs
            return Ok(new
            {
                message = "Login successful",
                userId = user.UserId, // Important for collection queries!
                userName = user.UserName,
                email = user.Email,
                joinDate = user.JoinDate
            });
        }



        // I need to creating another endpoit when users gives me their non google email i will first search in the database and
        // then if the user is the db then i dont need to send them code again and again 
    }
}

