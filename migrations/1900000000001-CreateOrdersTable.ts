import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateOrdersTable1900000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "orders",
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
            name: "order_number",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "user_id",
            type: "uuid",
          },
          {
            name: "first_name",
            type: "varchar",
          },
          {
            name: "last_name",
            type: "varchar",
          },
          {
            name: "email",
            type: "varchar",
          },
          {
            name: "phone",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "address",
            type: "text",
          },
          {
            name: "city",
            type: "varchar",
          },
          {
            name: "state",
            type: "varchar",
          },
          {
            name: "zip_code",
            type: "varchar",
          },
          {
            name: "country",
            type: "varchar",
          },
          {
            name: "subtotal_amount",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "discount_amount",
            type: "decimal",
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: "total_amount",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "promo_code_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "status",
            type: "varchar",
            default: "'pending'",
          },
          {
            name: "notes",
            type: "text",
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ["user_id"],
            referencedTableName: "customers",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            columnNames: ["promo_code_id"],
            referencedTableName: "promo_codes",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "orders",
      new TableIndex({
        name: "IDX_orders_order_number",
        columnNames: ["order_number"]
      })
    );

    await queryRunner.createIndex(
      "orders",
      new TableIndex({
        name: "IDX_orders_user_id",
        columnNames: ["user_id"]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("orders");
  }
}
