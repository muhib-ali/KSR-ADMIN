import { MigrationInterface, QueryRunner, Table, Index, Unique } from "typeorm";

export class CreateCustomerCart1790000000000 implements MigrationInterface {
  name = "CreateCustomerCart1790000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "customer_cart",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "gen_random_uuid()",
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
            name: "quantity",
            type: "int",
            default: 1,
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
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
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Create unique constraint on customer_id and product_id
    await queryRunner.query(
      `ALTER TABLE "customer_cart" ADD CONSTRAINT "UQ_customer_cart_customer_product" UNIQUE ("customer_id", "product_id")`
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_customer_cart_customer_id" ON "customer_cart" ("customer_id")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_customer_cart_product_id" ON "customer_cart" ("product_id")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_customer_cart_customer_product" ON "customer_cart" ("customer_id", "product_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("customer_cart");
  }
}
