import { MigrationInterface, QueryRunner } from "typeorm";

export class FixReviewedByType1900000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change reviewed_by column from uuid to varchar to store admin email/name
    await queryRunner.query(`ALTER TABLE "reviews" ALTER COLUMN "reviewed_by" TYPE varchar`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to uuid type
    await queryRunner.query(`ALTER TABLE "reviews" ALTER COLUMN "reviewed_by" TYPE uuid`);
  }
}
