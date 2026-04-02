using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollectorsArchive.Server.Models
{
    [Table("UserListCard")]
    public class UserListCard
    {
        [Key]
        public int ListCardID { get; set; }

        [Required]
        public int CardListID { get; set; }

        [Required]
        public int PrintID { get; set; }

        [Required]
        public int Quantity { get; set; }
    }
}
