import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingWishlistsAuditColumns1800000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "wishlists" ADD COLUMN "created_by" varchar;
      EXCEPTION WHEN duplicate_column THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "wishlists" ADD COLUMN "updated_by" varchar;
      EXCEPTION WHEN duplicate_column THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "wishlists" ADD COLUMN "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP;
      EXCEPTION WHEN duplicate_column THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "wishlists" ADD COLUMN "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP;
      EXCEPTION WHEN duplicate_column THEN null;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "wishlists" DROP COLUMN "updated_at";
      EXCEPTION WHEN undefined_column THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "wishlists" DROP COLUMN "created_at";
      EXCEPTION WHEN undefined_column THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "wishlists" DROP COLUMN "updated_by";
      EXCEPTION WHEN undefined_column THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "wishlists" DROP COLUMN "created_by";
      EXCEPTION WHEN undefined_column THEN null;
      END $$;
    `);
  }
}
