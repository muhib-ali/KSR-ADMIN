import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUniqueConstraintCustomerCart1900000000012 implements MigrationInterface {
    name = 'RemoveUniqueConstraintCustomerCart1900000000012'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the unique constraint that prevents multiple bulk items of same product
        await queryRunner.query(`ALTER TABLE "customer_cart" DROP CONSTRAINT "UQ_customer_cart_customer_product"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Re-add the unique constraint if we need to rollback
        await queryRunner.query(`ALTER TABLE "customer_cart" ADD CONSTRAINT "UQ_customer_cart_customer_product" UNIQUE ("customer_id", "product_id")`);
    }

}
