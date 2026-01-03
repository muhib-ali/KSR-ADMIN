import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateWishlistTable1790000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wishlists',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'customer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create unique constraint on customer_id and product_id combination
    await queryRunner.query(`
      ALTER TABLE wishlists 
      ADD CONSTRAINT UQ_wishlists_customer_product 
      UNIQUE (customer_id, product_id)
    `);

    // Create indexes for better performance
    await queryRunner.query(
      `CREATE INDEX "IDX_wishlists_customer_id" ON "wishlists" ("customer_id")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_wishlists_product_id" ON "wishlists" ("product_id")`
    );

    // Add foreign key constraints
    await queryRunner.createForeignKey(
      'wishlists',
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'wishlists',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('wishlists');
  }
}
