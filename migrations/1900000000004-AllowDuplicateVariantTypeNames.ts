import { MigrationInterface, QueryRunner, TableIndex, TableUnique } from "typeorm";

export class AllowDuplicateVariantTypeNames1900000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the unique constraint on variant_types.name
    await queryRunner.query(`
      ALTER TABLE "variant_types" DROP CONSTRAINT IF EXISTS "UQ_variant_types_name";
    `);

    // Also drop the unique index if it exists (TypeORM creates this)
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_variant_types_name";
    `);

    // Add a normal index on variant_types.name for search performance
    await queryRunner.createIndex(
      "variant_types",
      new TableIndex({
        name: "IDX_variant_types_name_search",
        columnNames: ["name"],
      })
    );

    // Add unique constraint on variants(product_id, vtype_id) to prevent duplicate variant types per product
    await queryRunner.createUniqueConstraint(
      "variants",
      new TableUnique({
        name: "UQ_variants_product_vtype",
        columnNames: ["product_id", "vtype_id"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the unique constraint on variants(product_id, vtype_id)
    await queryRunner.dropUniqueConstraint("variants", "UQ_variants_product_vtype");

    // Remove the search index on variant_types.name
    await queryRunner.dropIndex("variant_types", "IDX_variant_types_name_search");

    // Restore the unique constraint on variant_types.name
    await queryRunner.createUniqueConstraint(
      "variant_types",
      new TableUnique({
        name: "UQ_variant_types_name",
        columnNames: ["name"],
      })
    );
  }
}
