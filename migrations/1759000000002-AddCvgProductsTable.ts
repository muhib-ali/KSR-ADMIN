import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCvgProductsTable1759000000002 implements MigrationInterface {
  name = "AddCvgProductsTable1759000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "cvg_products" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_by" character varying,
                "updated_by" character varying,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "cvg_id" uuid NOT NULL,
                "product_id" uuid NOT NULL,
                CONSTRAINT "UQ_cvg_products_cvg_id_product_id" UNIQUE ("cvg_id", "product_id"),
                CONSTRAINT "FK_cvg_products_cvg_id" FOREIGN KEY ("cvg_id") REFERENCES "customer_visibility_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_cvg_products_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_cvg_products_cvg_id" ON "cvg_products" ("cvg_id")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_cvg_products_product_id" ON "cvg_products" ("product_id")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cvg_products_product_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cvg_products_cvg_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cvg_products"`);
  }
}
