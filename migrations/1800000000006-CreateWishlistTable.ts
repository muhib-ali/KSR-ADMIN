import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class CreateWishlistTable1800000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create wishlists table
    await queryRunner.createTable(
      new Table({
        name: "wishlists",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "customer_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "product_id",
            type: "uuid",
            isNullable: false,
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
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            columnNames: ["customer_id"],
            referencedTableName: "customers",
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
        indices: [
          {
            name: "IDX_WISHLISTS_CUSTOMER_PRODUCT",
            columnNames: ["customer_id", "product_id"],
            isUnique: true,
          },
          {
            name: "IDX_WISHLISTS_CUSTOMER_ID",
            columnNames: ["customer_id"],
          },
          {
            name: "IDX_WISHLISTS_PRODUCT_ID",
            columnNames: ["product_id"],
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("wishlists");
  }
}
