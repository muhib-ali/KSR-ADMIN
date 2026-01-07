import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateOrderPaymentsTable1900000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "order_payments",
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
            name: "payment_method",
            type: "varchar",
            default: "'online'",
          },
          {
            name: "card_last_four",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "cvc",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "card_brand",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "payment_amount",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "currency",
            type: "varchar",
            default: "'USD'",
          },
          {
            name: "paid_at",
            type: "timestamptz",
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ["order_id"],
            referencedTableName: "orders",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "order_payments",
      new TableIndex({
        name: "IDX_order_payments_order_id",
        columnNames: ["order_id"]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("order_payments");
  }
}
