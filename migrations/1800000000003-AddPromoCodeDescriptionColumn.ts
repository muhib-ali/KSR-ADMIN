import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPromoCodeDescriptionColumn1800000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "promo_codes",
      new TableColumn({
        name: "description",
        type: "varchar",
        isNullable: false,
        default: "''",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("promo_codes", "description");
  }
}
