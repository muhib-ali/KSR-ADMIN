import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateHomeCmsSectionsTable2000000000004
  implements MigrationInterface
{
  name = "CreateHomeCmsSectionsTable2000000000004";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "home_cms_sections" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "section_key" character varying(255) NOT NULL,
        "subsection_key" character varying(255),
        "label" character varying(500),
        "title" character varying(500),
        "description" text,
        "section_img_url" character varying(1000),
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_by" character varying,
        "updated_by" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_home_cms_sections" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_home_cms_sections_section_key" ON "home_cms_sections" ("section_key")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_home_cms_sections_section_subsection" ON "home_cms_sections" ("section_key", "subsection_key")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "home_cms_sections"`);
  }
}
