import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateReviewsTable1900000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "reviews",
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
            name: "product_id",
            type: "uuid",
          },
          {
            name: "user_id",
            type: "uuid",
          },
          {
            name: "order_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "rating",
            type: "int",
          },
          {
            name: "comment",
            type: "text",
          },
          {
            name: "status",
            type: "varchar",
            default: "'pending'",
          },
          {
            name: "is_verified_purchase",
            type: "boolean",
            default: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ["product_id"],
            referencedTableName: "products",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            columnNames: ["user_id"],
            referencedTableName: "customers",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            columnNames: ["order_id"],
            referencedTableName: "orders",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
          },
        ],
      }),
      true
    );

    // One review per user per product
    await queryRunner.createIndex(
      "reviews",
      new TableIndex({
        name: "UQ_reviews_product_user",
        columnNames: ["product_id", "user_id"],
        isUnique: true,
      })
    );

    await queryRunner.createIndex(
      "reviews",
      new TableIndex({
        name: "IDX_reviews_product_status",
        columnNames: ["product_id", "status"],
      })
    );

    await queryRunner.createIndex(
      "reviews",
      new TableIndex({
        name: "IDX_reviews_user_id",
        columnNames: ["user_id"],
      })
    );

    await queryRunner.createIndex(
      "reviews",
      new TableIndex({
        name: "IDX_reviews_created_at",
        columnNames: ["created_at"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("reviews");
  }
}
