import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class AddWarehouseIsActiveColumn1758000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing columns from BaseAuditColumns to warehouses table
    await queryRunner.addColumn(
      "warehouses",
      new TableColumn({
        name: "is_active",
        type: "boolean",
        default: true,
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      "warehouses",
      new TableColumn({
        name: "created_by",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "warehouses",
      new TableColumn({
        name: "updated_by",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the columns if we need to rollback
    await queryRunner.dropColumn("warehouses", "updated_by");
    await queryRunner.dropColumn("warehouses", "created_by");
    await queryRunner.dropColumn("warehouses", "is_active");
  }
}
