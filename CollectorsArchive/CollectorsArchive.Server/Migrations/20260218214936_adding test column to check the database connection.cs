using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CollectorsArchive.Server.Migrations
{
    /// <inheritdoc />
    public partial class addingtestcolumntocheckthedatabaseconnection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "test",
                table: "UserInformation",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "test",
                table: "UserInformation");
        }
    }
}
