import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateOtpsTable1800000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "otps",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
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
            name: "customer_id",
            type: "uuid",
          },
          {
            name: "token",
            type: "varchar",
            length: "10",
          },
          {
            name: "type",
            type: "varchar",
          },
          {
            name: "status",
            type: "varchar",
          },
          {
            name: "expires_at",
            type: "timestamptz",
          },
          {
            name: "used_at",
            type: "timestamptz",
            isNullable: true,
          },
          {
            name: "recipient",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "attempts",
            type: "int",
          },
        ],
        foreignKeys: [
          {
            columnNames: ["customer_id"],
            referencedTableName: "customers",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "otps",
      new TableIndex({
        name: "IDX_otps_token",
        columnNames: ["token"]
      })
    );

    await queryRunner.createIndex(
      "otps",
      new TableIndex({
        name: "IDX_otps_customer_id",
        columnNames: ["customer_id"]
      })
    );

    await queryRunner.createIndex(
      "otps",
      new TableIndex({
        name: "IDX_otps_type",
        columnNames: ["type"]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("otps");
  }
}
