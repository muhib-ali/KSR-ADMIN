import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBulkCartSupport1900000000010 implements MigrationInterface {
    name = 'AddBulkCartSupport1900000000010'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "customer_cart" 
            ADD COLUMN "type" character varying(20) DEFAULT 'regular'
        `);
        
        await queryRunner.query(`
            ALTER TABLE "customer_cart" 
            ADD COLUMN "requested_price_per_unit" numeric(10,2)
        `);
        
        await queryRunner.query(`
            ALTER TABLE "customer_cart" 
            ADD COLUMN "offered_price_per_unit" numeric(10,2)
        `);
        
        await queryRunner.query(`
            ALTER TABLE "customer_cart" 
            ADD COLUMN "bulk_min_quantity" integer
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_customer_cart_type" ON "customer_cart" ("type")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_cart_type"`);
        await queryRunner.query(`ALTER TABLE "customer_cart" DROP COLUMN "bulk_min_quantity"`);
        await queryRunner.query(`ALTER TABLE "customer_cart" DROP COLUMN "offered_price_per_unit"`);
        await queryRunner.query(`ALTER TABLE "customer_cart" DROP COLUMN "requested_price_per_unit"`);
        await queryRunner.query(`ALTER TABLE "customer_cart" DROP COLUMN "type"`);
    }
}
