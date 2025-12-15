import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleTypesAndCustomers1734300000000 implements MigrationInterface {
  name = "AddRoleTypesAndCustomers1734300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Create role_types table
    await queryRunner.query(`
      CREATE TABLE "role_types" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_by" character varying,
        "updated_by" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "name" character varying NOT NULL,
        CONSTRAINT "UQ_role_types_name" UNIQUE ("name")
      )
    `);

    // 2) Seed role_types with users and systemUsers
    await queryRunner.query(`
      INSERT INTO "role_types" ("name") VALUES ('users'), ('systemUsers')
    `);

    // 3) Add role_type_id column to roles (nullable first)
    await queryRunner.query(`
      ALTER TABLE "roles" ADD COLUMN "role_type_id" uuid
    `);

    // 4) Get role_type IDs and backfill existing roles as systemUsers
    await queryRunner.query(`
      UPDATE "roles" 
      SET "role_type_id" = (SELECT "id" FROM "role_types" WHERE "name" = 'systemUsers')
      WHERE "role_type_id" IS NULL
    `);

    // 5) Make role_type_id NOT NULL and add FK
    await queryRunner.query(`
      ALTER TABLE "roles" ALTER COLUMN "role_type_id" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "roles" 
      ADD CONSTRAINT "FK_roles_role_type_id" 
      FOREIGN KEY ("role_type_id") REFERENCES "role_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // 6) Rename users table to system_users
    await queryRunner.query(`ALTER TABLE "users" RENAME TO "system_users"`);

    // 7) Rename constraints and indexes for system_users
    await queryRunner.query(`ALTER TABLE "system_users" RENAME CONSTRAINT "UQ_users_email" TO "UQ_system_users_email"`);
    await queryRunner.query(`ALTER TABLE "system_users" RENAME CONSTRAINT "FK_users_role_id" TO "FK_system_users_role_id"`);

    // 8) Update oauth_tokens FK to reference system_users
    await queryRunner.query(`ALTER TABLE "oauth_tokens" DROP CONSTRAINT "FK_oauth_tokens_userId"`);
    await queryRunner.query(`
      ALTER TABLE "oauth_tokens" 
      ADD CONSTRAINT "FK_oauth_tokens_userId" 
      FOREIGN KEY ("userId") REFERENCES "system_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // 9) Create customers table
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
        "role_id" uuid NOT NULL,
        CONSTRAINT "UQ_customers_email" UNIQUE ("email"),
        CONSTRAINT "UQ_customers_username" UNIQUE ("username"),
        CONSTRAINT "FK_customers_role_id" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // 10) Create indexes for customers
    await queryRunner.query(`CREATE INDEX "IDX_customers_email" ON "customers" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_customers_username" ON "customers" ("username")`);

    // 11) Create customer_tokens table
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

    // 12) Create indexes for customer_tokens
    await queryRunner.query(`CREATE INDEX "IDX_customer_tokens_token" ON "customer_tokens" ("token")`);
    await queryRunner.query(`CREATE INDEX "IDX_customer_tokens_customer_id" ON "customer_tokens" ("customer_id")`);

    // 13) Seed customer role (role_type = users)
    await queryRunner.query(`
      INSERT INTO "roles" ("title", "slug", "role_type_id", "is_active")
      SELECT 'Customer', 'customer', rt.id, true
      FROM "role_types" rt
      WHERE rt.name = 'users'
      AND NOT EXISTS (SELECT 1 FROM "roles" WHERE "slug" = 'customer')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop customer role
    await queryRunner.query(`DELETE FROM "roles" WHERE "slug" = 'customer'`);

    // Drop customer_tokens indexes and table
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_tokens_customer_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_tokens_token"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "customer_tokens"`);

    // Drop customers indexes and table
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_username"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_email"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "customers"`);

    // Revert oauth_tokens FK to reference users
    await queryRunner.query(`ALTER TABLE "oauth_tokens" DROP CONSTRAINT "FK_oauth_tokens_userId"`);
    await queryRunner.query(`
      ALTER TABLE "oauth_tokens" 
      ADD CONSTRAINT "FK_oauth_tokens_userId" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Rename system_users back to users
    await queryRunner.query(`ALTER TABLE "system_users" RENAME CONSTRAINT "UQ_system_users_email" TO "UQ_users_email"`);
    await queryRunner.query(`ALTER TABLE "system_users" RENAME CONSTRAINT "FK_system_users_role_id" TO "FK_users_role_id"`);
    await queryRunner.query(`ALTER TABLE "system_users" RENAME TO "users"`);

    // Drop role_type_id from roles
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_roles_role_type_id"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "role_type_id"`);

    // Drop role_types table
    await queryRunner.query(`DROP TABLE IF EXISTS "role_types"`);
  }
}
