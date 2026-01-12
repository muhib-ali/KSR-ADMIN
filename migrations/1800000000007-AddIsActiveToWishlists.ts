import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveToWishlists1800000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "wishlists" ADD COLUMN "is_active" boolean NOT NULL DEFAULT true;
      EXCEPTION WHEN duplicate_column THEN null;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "wishlists" DROP COLUMN "is_active";
      EXCEPTION WHEN undefined_column THEN null;
      END $$;
    `);
  }
}
