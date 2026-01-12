import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingPromoCodeColumnsSafe1800000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add type enum if not exists
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."promo_codes_type_enum" AS ENUM('percentage', 'fixed');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // Add columns only if they don't exist
    const columns = [
      { name: "type", sql: `ALTER TABLE "promo_codes" ADD "type" "public"."promo_codes_type_enum" NOT NULL DEFAULT 'percentage'` },
      { name: "minimum_order_amount", sql: `ALTER TABLE "promo_codes" ADD "minimum_order_amount" decimal(10,2) NOT NULL DEFAULT 0` },
      { name: "usage_limit", sql: `ALTER TABLE "promo_codes" ADD "usage_limit" int NOT NULL DEFAULT 1` },
      { name: "usage_count", sql: `ALTER TABLE "promo_codes" ADD "usage_count" int NOT NULL DEFAULT 0` },
      { name: "expires_at", sql: `ALTER TABLE "promo_codes" ADD "expires_at" date` },
      { name: "is_active", sql: `ALTER TABLE "promo_codes" ADD "is_active" boolean NOT NULL DEFAULT true` },
    ];

    for (const col of columns) {
      await queryRunner.query(`
        DO $$ BEGIN
          ${col.sql};
        EXCEPTION WHEN duplicate_column THEN null;
        END $$;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop columns if they exist (safe)
    const columns = ["type", "minimum_order_amount", "usage_limit", "usage_count", "expires_at", "is_active"];
    for (const col of columns) {
      await queryRunner.query(`
        DO $$ BEGIN
          ALTER TABLE "promo_codes" DROP COLUMN "${col}";
        EXCEPTION WHEN undefined_column THEN null;
        END $$;
      `);
    }

    // Drop enum type if exists
    await queryRunner.query(`
      DO $$ BEGIN
        DROP TYPE "public"."promo_codes_type_enum";
      EXCEPTION WHEN undefined_object THEN null;
      END $$;
    `);
  }
}
