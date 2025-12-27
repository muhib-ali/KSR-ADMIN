import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class AddProductVideoUrlTaxSupplier1758000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Add product_video_url to products
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "product_video_url",
        type: "varchar",
        length: "512",
        isNullable: true,
      })
    );

    // 2) Create taxes table
    await queryRunner.createTable(
      new Table({
        name: "taxes",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "title",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "rate",
            type: "decimal",
            precision: 5,
            scale: 2,
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "deleted_at",
            type: "timestamp",
            isNullable: true,
          },
        ],
        indices: [
          {
            name: "IDX_TAXES_TITLE",
            columnNames: ["title"],
            isUnique: true,
          },
          {
            name: "IDX_TAXES_IS_ACTIVE",
            columnNames: ["is_active"],
          },
        ],
      })
    );

    // 3) Add tax_id to products
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "tax_id",
        type: "uuid",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "products",
      new TableForeignKey({
        columnNames: ["tax_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "taxes",
        onDelete: "SET NULL",
      })
    );

    // 5) Create suppliers table
    await queryRunner.createTable(
      new Table({
        name: "suppliers",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "supplier_name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "email",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "phone",
            type: "varchar",
            length: "50",
            isNullable: true,
          },
          {
            name: "address",
            type: "text",
            isNullable: true,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "deleted_at",
            type: "timestamp",
            isNullable: true,
          },
        ],
        indices: [
          {
            name: "IDX_SUPPLIERS_SUPPLIER_NAME",
            columnNames: ["supplier_name"],
            isUnique: true,
          },
          {
            name: "IDX_SUPPLIERS_IS_ACTIVE",
            columnNames: ["is_active"],
          },
        ],
      })
    );

    // 6) Create warehouses table
    await queryRunner.createTable(
      new Table({
        name: "warehouses",
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
            length: "255",
            isNullable: false,
          },
          {
            name: "code",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "address",
            type: "text",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "deleted_at",
            type: "timestamp",
            isNullable: true,
          },
        ],
        indices: [
          {
            name: "IDX_WAREHOUSES_CODE",
            columnNames: ["code"],
            isUnique: true,
          },
        ],
      })
    );

    // 7) Add supplier_id to products
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "supplier_id",
        type: "uuid",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "products",
      new TableForeignKey({
        columnNames: ["supplier_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "suppliers",
        onDelete: "SET NULL",
      })
    );

    // 8) Add warehouse_id to products
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "warehouse_id",
        type: "uuid",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "products",
      new TableForeignKey({
        columnNames: ["warehouse_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "warehouses",
        onDelete: "SET NULL",
      })
    );

    // 9) Add discount columns and product dimensions to products
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "discount",
        type: "decimal",
        precision: 5,
        scale: 2,
        default: 0,
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "start_discount_date",
        type: "timestamp",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "end_discount_date",
        type: "timestamp",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "length",
        type: "decimal",
        precision: 10,
        scale: 2,
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "width",
        type: "decimal",
        precision: 10,
        scale: 2,
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "height",
        type: "decimal",
        precision: 10,
        scale: 2,
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "weight",
        type: "decimal",
        precision: 10,
        scale: 2,
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "total_price",
        type: "decimal",
        precision: 10,
        scale: 2,
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    const productTable = await queryRunner.getTable("products");
    const taxForeignKey = productTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("tax_id") !== -1
    );
    const supplierForeignKey = productTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("supplier_id") !== -1
    );
    const warehouseForeignKey = productTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("warehouse_id") !== -1
    );

    if (taxForeignKey) await queryRunner.dropForeignKey("products", taxForeignKey);
    if (supplierForeignKey) await queryRunner.dropForeignKey("products", supplierForeignKey);
    if (warehouseForeignKey) await queryRunner.dropForeignKey("products", warehouseForeignKey);

    // Drop columns
    await queryRunner.dropColumn("products", "tax_id");
    await queryRunner.dropColumn("products", "supplier_id");
    await queryRunner.dropColumn("products", "warehouse_id");
    await queryRunner.dropColumn("products", "product_video_url");
    await queryRunner.dropColumn("products", "discount");
    await queryRunner.dropColumn("products", "start_discount_date");
    await queryRunner.dropColumn("products", "end_discount_date");
    await queryRunner.dropColumn("products", "length");
    await queryRunner.dropColumn("products", "width");
    await queryRunner.dropColumn("products", "height");
    await queryRunner.dropColumn("products", "weight");
    await queryRunner.dropColumn("products", "total_price");

    // Drop tables
    await queryRunner.dropTable("taxes");
    await queryRunner.dropTable("suppliers");
    await queryRunner.dropTable("warehouses");
  }
}
