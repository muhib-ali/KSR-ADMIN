import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddReviewsAdminColumns1900000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add admin-specific columns to reviews table
    await queryRunner.addColumns("reviews", [
      new TableColumn({
        name: "admin_notes",
        type: "text",
        isNullable: true,
      }),
      new TableColumn({
        name: "rejection_reason", 
        type: "text",
        isNullable: true,
      }),
      new TableColumn({
        name: "reviewed_by",
        type: "uuid",
        isNullable: true,
      }),
      new TableColumn({
        name: "reviewed_at",
        type: "timestamptz",
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove admin-specific columns from reviews table
    await queryRunner.dropColumns("reviews", [
      "admin_notes",
      "rejection_reason", 
      "reviewed_by",
      "reviewed_at",
    ]);
  }
}
