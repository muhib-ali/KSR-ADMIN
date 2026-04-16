import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserActivitiesTable1740000000000 implements MigrationInterface {
  name = "CreateUserActivitiesTable1740000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_activities" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_by" character varying,
        "updated_by" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL,
        "action" character varying(50) NOT NULL,
        "module" character varying(100),
        "ip_address" character varying(50),
        "user_agent" text,
        "login_time" TIMESTAMP WITH TIME ZONE,
        "logout_time" TIMESTAMP WITH TIME ZONE,
        "details" jsonb
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_activities"`);
  }
}
