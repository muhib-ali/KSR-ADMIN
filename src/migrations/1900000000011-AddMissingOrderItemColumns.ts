import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingOrderItemColumns1900000000011 implements MigrationInterface {
  name = 'AddMissingOrderItemColumns1900000000011'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_items"
      ADD COLUMN IF NOT EXISTS "requested_price_per_unit" numeric(10,2)
    `);

    await queryRunner.query(`
      ALTER TABLE "order_items"
      ADD COLUMN IF NOT EXISTS "item_status" character varying(20) DEFAULT 'pending'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "order_items"."item_status" IS 'For bulk orders: pending, accepted, rejected'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_items" DROP COLUMN IF EXISTS "item_status"
    `);

    await queryRunner.query(`
      ALTER TABLE "order_items" DROP COLUMN IF EXISTS "requested_price_per_unit"
    `);
  }
}
