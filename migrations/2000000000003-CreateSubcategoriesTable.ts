import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSubcategoriesTable2000000000003 implements MigrationInterface {
  name = "CreateSubcategoriesTable2000000000003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "subcategories" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_by" character varying,
        "updated_by" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "name" character varying NOT NULL,
        "description" character varying,
        "cat_id" uuid NOT NULL,
        CONSTRAINT "FK_subcategories_cat_id" FOREIGN KEY ("cat_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_subcategories_cat_id" ON "subcategories" ("cat_id")`);

    await queryRunner.query(`
      ALTER TABLE "products" ADD COLUMN "subcategory_id" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "products" ADD CONSTRAINT "FK_products_subcategory_id"
      FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`CREATE INDEX "IDX_products_subcategory_id" ON "products" ("subcategory_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_subcategory_id"`);
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_products_subcategory_id"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "subcategory_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subcategories_cat_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subcategories"`);
  }
}
