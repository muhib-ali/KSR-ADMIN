import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePromoCodesTable1800000000001 implements MigrationInterface {
  name = "CreatePromoCodesTable1800000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "promo_codes" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_by" character varying,
                "updated_by" character varying,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "code" character varying NOT NULL,
                "value" numeric(5,2) NOT NULL,
                "usage_limit" integer,
                "usage_count" integer NOT NULL DEFAULT 0,
                "expires_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_promo_codes_code" UNIQUE ("code")
            )
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_promo_codes_code" ON "promo_codes" ("code")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_promo_codes_code"`);
    await queryRunner.query(`DROP TABLE "promo_codes"`);
  }
}
