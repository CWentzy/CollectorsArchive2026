using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollectorsArchive.Server.Models
{
    public class UserProfile
    {
        [Key]
        public int ProfileId { get; set; }
        public int UserId { get; set; }
        public string? Bio { get; set; }
        public string? PhotoUrl { get; set; }
        public DateTime JoinDate { get; set; }
        // Navigation property — back-reference to the owning user
        [ForeignKey("UserId")]
        public UserInformation? User { get; set; }
    }
}