import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleTypesAndSystemUsers1734300000000 implements MigrationInterface {
  name = "AddRoleTypesAndSystemUsers1734300000000";

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

    // 2) Seed role_types with systemUsers only (customers handled separately)
    await queryRunner.query(`
      INSERT INTO "role_types" ("name") VALUES ('systemUsers')
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

    // 6) Update constraints and indexes for system_users (already created by Init migration)
    await queryRunner.query(`ALTER TABLE "system_users" RENAME CONSTRAINT "UQ_users_email" TO "UQ_system_users_email"`);
    await queryRunner.query(`ALTER TABLE "system_users" RENAME CONSTRAINT "FK_users_role_id" TO "FK_system_users_role_id"`);

    // Note: oauth_tokens already references system_users from Init migration, no need to update

    // Note: Customer tables (customers, customer_tokens) are handled by KSR-CUSTOMER module
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rename system_users constraints back to users names
    await queryRunner.query(`ALTER TABLE "system_users" RENAME CONSTRAINT "UQ_system_users_email" TO "UQ_users_email"`);
    await queryRunner.query(`ALTER TABLE "system_users" RENAME CONSTRAINT "FK_system_users_role_id" TO "FK_users_role_id"`);

    // Drop role_type_id from roles
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_roles_role_type_id"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "role_type_id"`);

    // Drop role_types table
    await queryRunner.query(`DROP TABLE IF EXISTS "role_types"`);

    // Note: Customer tables are handled by KSR-CUSTOMER module migrations
  }
}
