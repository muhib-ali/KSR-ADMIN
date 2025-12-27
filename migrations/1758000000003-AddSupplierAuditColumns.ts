import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSupplierAuditColumns1758000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing columns from BaseAuditColumns to suppliers table
    await queryRunner.addColumn(
      "suppliers",
      new TableColumn({
        name: "created_by",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "suppliers",
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
    await queryRunner.dropColumn("suppliers", "updated_by");
    await queryRunner.dropColumn("suppliers", "created_by");
  }
}
