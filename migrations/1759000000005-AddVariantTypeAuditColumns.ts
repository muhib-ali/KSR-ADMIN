import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVariantTypeAuditColumns1759000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "variant_types" 
      ADD COLUMN "created_by" varchar,
      ADD COLUMN "updated_by" varchar
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "variant_types" 
      DROP COLUMN "created_by",
      DROP COLUMN "updated_by"
    `);
  }
}
