import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomerTablesFixed1770000000001 implements MigrationInterface {
  name = "CreateCustomerTablesFixed1770000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create customers table
    await queryRunner.query(`
            CREATE TABLE "customers" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_by" character varying,
                "updated_by" character varying,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "fullname" character varying NOT NULL,
                "username" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "phone" character varying,
                "is_email_verified" boolean NOT NULL DEFAULT false,
                "is_phone_verified" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_customers_email" UNIQUE ("email"),
                CONSTRAINT "UQ_customers_username" UNIQUE ("username")
            )
        `);

    // Create customer_tokens table
    await queryRunner.query(`
            CREATE TABLE "customer_tokens" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_by" character varying,
                "updated_by" character varying,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "customer_id" uuid NOT NULL,
                "name" character varying NOT NULL,
                "token" character varying NOT NULL,
                "refresh_token" character varying NOT NULL,
                "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "revoked" boolean NOT NULL DEFAULT false,
                CONSTRAINT "FK_customer_tokens_customer_id" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);

    // NOTE: oauth_tokens table is handled by KSR-ADMIN, we only use customer_tokens

    // Create indexes for customer_tokens only
    await queryRunner.query(`CREATE INDEX "IDX_customer_tokens_token" ON "customer_tokens" ("token")`);
    await queryRunner.query(`CREATE INDEX "IDX_customer_tokens_customer_id" ON "customer_tokens" ("customer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_customer_tokens_expires_at" ON "customer_tokens" ("expires_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_customer_tokens_revoked" ON "customer_tokens" ("revoked")`);

    await queryRunner.query(`CREATE INDEX "IDX_customers_email" ON "customers" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_customers_username" ON "customers" ("username")`);
    await queryRunner.query(`CREATE INDEX "IDX_customers_is_active" ON "customers" ("is_active")`);
    await queryRunner.query(`CREATE INDEX "IDX_customers_is_email_verified" ON "customers" ("is_email_verified")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes for customer_tokens only
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_is_email_verified"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_username"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_email"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_tokens_revoked"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_tokens_expires_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_tokens_customer_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_tokens_token"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "customer_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "customers"`);
  }
}
