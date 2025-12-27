import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBulkPricesTable1759000000003 implements MigrationInterface {
  name = "AddBulkPricesTable1759000000003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "bulk_prices" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_by" character varying,
                "updated_by" character varying,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "quantity" integer NOT NULL,
                "price_per_product" numeric(10,2) NOT NULL,
                "product_id" uuid NOT NULL,
                CONSTRAINT "FK_bulk_prices_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_bulk_prices_product_id" ON "bulk_prices" ("product_id")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_bulk_prices_quantity" ON "bulk_prices" ("quantity")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bulk_prices_quantity"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bulk_prices_product_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bulk_prices"`);
  }
}
