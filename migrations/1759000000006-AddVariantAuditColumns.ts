import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddVariantAuditColumns1759000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing audit columns to variants table
    await queryRunner.addColumn(
      "variants",
      new TableColumn({
        name: "is_active",
        type: "boolean",
        default: true,
      })
    );

    await queryRunner.addColumn(
      "variants",
      new TableColumn({
        name: "created_by",
        type: "varchar",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "variants",
      new TableColumn({
        name: "updated_by",
        type: "varchar",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("variants", "updated_by");
    await queryRunner.dropColumn("variants", "created_by");
    await queryRunner.dropColumn("variants", "is_active");
  }
}

