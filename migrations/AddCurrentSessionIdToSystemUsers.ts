import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCurrentSessionIdToSystemUsers1739999999999 implements MigrationInterface {
  name = "AddCurrentSessionIdToSystemUsers1739999999999";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "system_users"
      ADD COLUMN "currentSessionId" uuid
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "system_users"
      DROP COLUMN "currentSessionId"
    `);
  }
}