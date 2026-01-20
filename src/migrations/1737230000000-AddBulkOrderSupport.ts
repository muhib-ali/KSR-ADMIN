import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBulkOrderSupport1737230000000 implements MigrationInterface {
    name = 'AddBulkOrderSupport1737230000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add bulk_pricing column to products table
        await queryRunner.query(`
            ALTER TABLE "products" 
            ADD COLUMN "bulk_pricing" jsonb NULL
        `);

        // Add order_type column to orders table
        await queryRunner.query(`
            ALTER TABLE "orders" 
            ADD COLUMN "order_type" varchar(20) NOT NULL DEFAULT 'regular'
        `);

        // Add bulk pricing columns to order_items table
        await queryRunner.query(`
            ALTER TABLE "order_items" 
            ADD COLUMN "offered_price_per_unit" decimal(10,2) NULL,
            ADD COLUMN "requested_price_per_unit" decimal(10,2) NULL,
            ADD COLUMN "bulk_min_quantity" integer NULL,
            ADD COLUMN "item_status" varchar(20) NULL DEFAULT 'pending'
        `);

        // Add comments for documentation
        await queryRunner.query(`
            COMMENT ON COLUMN "products"."bulk_pricing" IS 'JSON structure: {"10": {"price": 90, "minQty": 10}, "20": {"price": 80, "minQty": 20}}'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "orders"."order_type" IS 'Order type: regular or bulk'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "order_items"."item_status" IS 'For bulk orders: pending, accepted, rejected'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove bulk pricing columns from order_items
        await queryRunner.query(`
            ALTER TABLE "order_items" 
            DROP COLUMN "item_status",
            DROP COLUMN "bulk_min_quantity",
            DROP COLUMN "requested_price_per_unit",
            DROP COLUMN "offered_price_per_unit"
        `);

        // Remove order_type from orders
        await queryRunner.query(`
            ALTER TABLE "orders" 
            DROP COLUMN "order_type"
        `);

        // Remove bulk_pricing from products
        await queryRunner.query(`
            ALTER TABLE "products" 
            DROP COLUMN "bulk_pricing"
        `);
    }
}
