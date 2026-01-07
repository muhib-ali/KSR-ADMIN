import { Entity, Column, Unique, Index } from "typeorm";
import { BaseAuditColumns } from "./base-audit-columns.entity";

@Entity("promo_codes")
@Unique(["code"])
@Index(["code"])
export class PromoCode extends BaseAuditColumns {
  @Column({ type: "varchar" })
  code: string;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  value: number;

  @Column({ type: "int", nullable: true })
  usage_limit: number;

  @Column({ type: "int", default: 0 })
  usage_count: number;

  @Column({ type: "timestamptz", nullable: true })
  expires_at: Date;
}
