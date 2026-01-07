import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateOrderItemsTable1900000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "order_items",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
          },
          {
            name: "created_by",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "updated_by",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "now()",
          },
          {
            name: "order_id",
            type: "uuid",
          },
          {
            name: "product_id",
            type: "uuid",
          },
          {
            name: "product_name",
            type: "varchar",
          },
          {
            name: "product_sku",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "quantity",
            type: "int",
          },
          {
            name: "unit_price",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "total_price",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
        ],
        foreignKeys: [
          {
            columnNames: ["order_id"],
            referencedTableName: "orders",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            columnNames: ["product_id"],
            referencedTableName: "products",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "order_items",
      new TableIndex({
        name: "IDX_order_items_order_id",
        columnNames: ["order_id"]
      })
    );

    await queryRunner.createIndex(
      "order_items",
      new TableIndex({
        name: "IDX_order_items_product_id",
        columnNames: ["product_id"]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("order_items");
  }
}
