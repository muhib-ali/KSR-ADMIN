import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductTitleUniqueIndex2000000000002 implements MigrationInterface {
  name = "AddProductTitleUniqueIndex2000000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Case-insensitive unique constraint on product name (title).
    // If duplicate titles exist (same after LOWER+TRIM), migration will fail; fix duplicates first.
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_products_title_lower"
      ON "products" (LOWER(TRIM("title")))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_products_title_lower"`);
  }
}
