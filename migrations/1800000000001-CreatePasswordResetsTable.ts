import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreatePasswordResetsTable1800000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "password_resets",
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
            length: "255",
            isUnique: true,
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
      "password_resets",
      new TableIndex({
        name: "IDX_password_resets_token",
        columnNames: ["token"]
      })
    );

    await queryRunner.createIndex(
      "password_resets",
      new TableIndex({
        name: "IDX_password_resets_customer_id",
        columnNames: ["customer_id"]
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("password_resets");
  }
}
