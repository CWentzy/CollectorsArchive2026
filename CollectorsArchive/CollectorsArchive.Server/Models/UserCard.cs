using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollectorsArchive.Server.Models
{
    [Table("UserCard")]
    public class UserCard
    {
        [Key]
        public int UserCardID { get; set; }
        [Required]
        public int UserProfileID { get; set; }
        [Required]
        public int PrintID { get; set; }
        [Required]
        public int Quantity { get; set; }
        
        public string? CardEditionID { get; set; }
    }
}
