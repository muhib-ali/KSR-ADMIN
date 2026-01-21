import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBlogsTable2000000000001 implements MigrationInterface {
    name = 'CreateBlogsTable2000000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "blogs" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "heading" character varying(255) NOT NULL,
                "paragraph" text NOT NULL,
                "blog_img" character varying(500),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_by" character varying,
                "updated_by" character varying,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_blogs" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_blogs_created_at" ON "blogs" ("created_at")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_blogs_is_active" ON "blogs" ("is_active")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "blogs"`);
    }
}
