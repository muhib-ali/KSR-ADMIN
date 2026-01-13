import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddCustomerRoleId1900000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First add role_id column as nullable (because existing rows have no role_id)
    await queryRunner.addColumn(
      "customers",
      new TableColumn({
        name: "role_id",
        type: "uuid",
        isNullable: true, // Start as nullable to handle existing rows
      })
    );

    // Get a default role ID (assuming there's a default role in the roles table)
    // We'll use the first role we find as default for existing customers
    const defaultRoleResult = await queryRunner.query(`SELECT id FROM roles LIMIT 1`);
    const defaultRoleId = defaultRoleResult[0]?.id;

    if (defaultRoleId) {
      // Update existing customers to have the default role
      await queryRunner.query(
        `UPDATE "customers" SET "role_id" = $1 WHERE "role_id" IS NULL`,
        [defaultRoleId]
      );
    }

    // Now alter the column to be NOT NULL
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "role_id" SET NOT NULL`
    );

    // Add foreign key constraint for role_id
    await queryRunner.createForeignKey(
      "customers",
      new TableForeignKey({
        columnNames: ["role_id"],
        referencedTableName: "roles",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      })
    );

    // Create index for role_id
    await queryRunner.query(`CREATE INDEX "IDX_customers_role_id" ON "customers" ("role_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customers_role_id"`);
    
    // Drop foreign key (TypeORM will handle this when dropping the column)
    
    // Drop role_id column
    await queryRunner.dropColumn("customers", "role_id");
  }
}
