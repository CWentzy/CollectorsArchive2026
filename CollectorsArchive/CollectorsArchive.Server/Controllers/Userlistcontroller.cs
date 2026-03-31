using CollectorsArchive.Server.Models;
using CollectorsArchive.Server.Models.ApiOutput;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace CollectorsArchive.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserListController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public UserListController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // ── GET: api/UserList/GetUserLists?userProfileID=1 ────────────────────
        [HttpGet("GetUserLists")]
        public async Task<IActionResult> GetUserLists([FromQuery] int userProfileID)
        {
            if (userProfileID <= 0)
                return BadRequest(new { message = "Valid userProfileID is required." });

            List<UserList> lists = [];
            string connectionString = _configuration.GetConnectionString("ErmiyasDb");

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand command = new SqlCommand("GetUserLists", conn))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@UserProfileID", userProfileID);

                await conn.OpenAsync();
                using (SqlDataReader reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        lists.Add(new UserList
                        {
                            UserListID = reader.GetInt32("UserListID"),
                            UserProfileID = reader.GetInt32("UserProfileID"),
                            UserListName = reader["UserListName"].ToString() ?? string.Empty,
                        });
                    }
                }
            }

            return Ok(lists);
        }

        // ── POST: api/UserList/CreateList ─────────────────────────────────────
        [HttpPost("CreateList")]
        public async Task<IActionResult> CreateList([FromBody] CreateListRequest request)
        {
            if (request.UserProfileID <= 0 || string.IsNullOrWhiteSpace(request.UserListName))
                return BadRequest(new { message = "UserProfileID and UserListName are required." });

            UserList created = null;
            string connectionString = _configuration.GetConnectionString("ErmiyasDb");

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand command = new SqlCommand("CreateUserList", conn))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@UserProfileID", request.UserProfileID);
                command.Parameters.AddWithValue("@UserListName", request.UserListName.Trim());

                await conn.OpenAsync();
                using (SqlDataReader reader = await command.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        created = new UserList
                        {
                            UserListID = reader.GetInt32("UserListID"),
                            UserProfileID = reader.GetInt32("UserProfileID"),
                            UserListName = reader["UserListName"].ToString() ?? string.Empty,
                        };
                    }
                }
            }

            if (created == null)
                return StatusCode(500, new { message = "Failed to create list." });

            return Ok(created);
        }

        // ── PUT: api/UserList/RenameList ──────────────────────────────────────
        [HttpPut("RenameList")]
        public async Task<IActionResult> RenameList([FromBody] RenameListRequest request)
        {
            if (request.UserListID <= 0 || string.IsNullOrWhiteSpace(request.UserListName))
                return BadRequest(new { message = "UserListID and UserListName are required." });

            string connectionString = _configuration.GetConnectionString("ErmiyasDb");

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand command = new SqlCommand("RenameUserList", conn))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@UserListID", request.UserListID);
                command.Parameters.AddWithValue("@UserListName", request.UserListName.Trim());

                await conn.OpenAsync();
                await command.ExecuteNonQueryAsync();
            }

            return Ok(new { message = "List renamed successfully." });
        }

        // ── DELETE: api/UserList/DeleteList?userListID=1 ──────────────────────
        [HttpDelete("DeleteList")]
        public async Task<IActionResult> DeleteList([FromQuery] int userListID)
        {
            if (userListID <= 0)
                return BadRequest(new { message = "Valid userListID is required." });

            string connectionString = _configuration.GetConnectionString("ErmiyasDb");

            using (SqlConnection conn = new SqlConnection(connectionString))
            using (SqlCommand command = new SqlCommand("DeleteUserList", conn))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@UserListID", userListID);

                await conn.OpenAsync();
                await command.ExecuteNonQueryAsync();
            }

            return Ok(new { message = "List deleted successfully." });
        }

        // ── GET: api/UserList/GetListCards?userListID=1 ───────────────────────
        [HttpGet("GetListCards")]
        public async Task<IActionResult> GetListCards([FromQuery] int userListID)
        {
            if (userListID <= 0)
                return BadRequest(new { message = "Valid userListID is required." });
            try
            {
                List<CardInformation> cards = [];
                List<PrintingInformation> printings = [];
                string connectionString = _configuration.GetConnectionString("ErmiyasDb");

                using (SqlConnection conn = new SqlConnection(connectionString))
                using (SqlCommand command = new SqlCommand("GetListCards", conn))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@UserListID", userListID);

                    await conn.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            cards.Add(new CardInformation
                            {
                                GameID = reader.GetInt32("GameID"),
                                CardID = reader["CardID"].ToString(),
                                CardName = reader["CardName"].ToString(),
                            });
                            
                            printings.Add(new PrintingInformation
                            {
                                GameID = reader.GetInt32("GameID"),
                                PrintID = reader.GetInt32("PrintID"),
                                CardID = reader["CardID"].ToString(),
                                CardName = reader["CardName"].ToString(),
                                SetID = reader.GetInt32("SetID"),
                                SetCode = reader["SetCode"]?.ToString() ?? string.Empty,
                                SetName = reader["SetName"]?.ToString() ?? string.Empty,
                                Rarity = reader["CardRarity"]?.ToString() ?? string.Empty,
                                ReleaseDate = DateTime.Now,
                                Quantity = reader["Quantity"] as int? ?? 0,
                            });
                        }
                    }
                }


                return Ok(new
                {
                    cards,
                    printings,
                });
            }
            catch (Exception ex)
    {
        // This will show the REAL error instead of a generic 500
        return StatusCode(500, new { message = ex.Message, detail = ex.StackTrace });
    }
        }

    }

    // ── Request Models ─────────────────────────────────────────────────────────
    public class CreateListRequest
    {
        public int UserProfileID { get; set; }
        public string UserListName { get; set; } = string.Empty;
    }

    public class RenameListRequest
    {
        public int UserListID { get; set; }
        public string UserListName { get; set; } = string.Empty;
    }
}