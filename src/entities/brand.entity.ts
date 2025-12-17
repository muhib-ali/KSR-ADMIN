import { Entity, Column, Unique, Index } from "typeorm";
import { BaseAuditColumns } from "./base-audit-columns.entity";

@Entity("brands")
@Unique(["name"])
@Index(["name"])
export class Brand extends BaseAuditColumns {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar", nullable: true })
  description: string;
}
