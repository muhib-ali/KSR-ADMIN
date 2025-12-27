import { MigrationInterface, QueryRunner, TableColumn, Table, TableForeignKey } from "typeorm";

export class AddTaxAuditColumns1758000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing columns from BaseAuditColumns to taxes table
    await queryRunner.addColumn(
      "taxes",
      new TableColumn({
        name: "created_by",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "taxes",
      new TableColumn({
        name: "updated_by",
        type: "varchar",
        length: "255",
        isNullable: true,
      })
    );

    // Create variant_type table
    await queryRunner.createTable(
      new Table({
        name: "variant_types",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
            length: "50",
            isUnique: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    // Create variant table
    await queryRunner.createTable(
      new Table({
        name: "variants",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "vtype_id",
            type: "uuid",
          },
          {
            name: "value",
            type: "varchar",
            length: "100",
          },
          {
            name: "product_id",
            type: "uuid",
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    // Add foreign keys for variants table
    await queryRunner.createForeignKey(
      "variants",
      new TableForeignKey({
        columnNames: ["vtype_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "variant_types",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "variants",
      new TableForeignKey({
        columnNames: ["product_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "products",
        onDelete: "CASCADE",
      })
    );

    // Insert seed data for variant_types
    await queryRunner.query(`
      INSERT INTO variant_types (name) VALUES 
      ('size'),
      ('model'),
      ('year')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order due to foreign key constraints
    await queryRunner.dropTable("variants");
    await queryRunner.dropTable("variant_types");
    
    // Remove the columns if we need to rollback
    await queryRunner.dropColumn("taxes", "updated_by");
    await queryRunner.dropColumn("taxes", "created_by");
  }
}
