import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddVariantTypeIsActiveColumn1759000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add only the missing is_active column to variant_types table
    await queryRunner.addColumn(
      "variant_types",
      new TableColumn({
        name: "is_active",
        type: "boolean",
        default: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("variant_types", "is_active");
  }
}
