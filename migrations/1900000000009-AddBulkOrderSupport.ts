import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBulkOrderSupport1900000000009 implements MigrationInterface {
  name = "AddBulkOrderSupport1900000000009";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add order_type column to orders table
    await queryRunner.query(`
      ALTER TABLE "orders" 
      ADD COLUMN "order_type" character varying(20) DEFAULT 'regular'
    `);

    // Add bulk pricing columns to order_items table
    await queryRunner.query(`
      ALTER TABLE "order_items" 
      ADD COLUMN "requested_price_per_unit" numeric(10,2),
      ADD COLUMN "offered_price_per_unit" numeric(10,2),
      ADD COLUMN "bulk_min_quantity" integer
    `);

    // Create index for order_type for faster filtering
    await queryRunner.query(`
      CREATE INDEX "IDX_orders_order_type" ON "orders" ("order_type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_order_type"`);
    await queryRunner.query(`
      ALTER TABLE "order_items" 
      DROP COLUMN IF EXISTS "bulk_min_quantity",
      DROP COLUMN IF EXISTS "offered_price_per_unit",
      DROP COLUMN IF EXISTS "requested_price_per_unit"
    `);
    await queryRunner.query(`
      ALTER TABLE "orders" 
      DROP COLUMN IF EXISTS "order_type"
    `);
  }
}
