import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomerVisibilityGroups1759000000001 implements MigrationInterface {
  name = "AddCustomerVisibilityGroups1759000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "customer_visibility_groups" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_by" character varying,
                "updated_by" character varying,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "type" character varying(50) NOT NULL,
                CONSTRAINT "UQ_customer_visibility_groups_type" UNIQUE ("type")
            )
        `);

    // Insert default customer visibility groups
    await queryRunner.query(`
            INSERT INTO "customer_visibility_groups" (type, created_by, updated_by) VALUES 
            ('Wholesale', 'system', 'system'),
            ('Retail', 'system', 'system')
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "customer_visibility_groups"`);
  }
}
