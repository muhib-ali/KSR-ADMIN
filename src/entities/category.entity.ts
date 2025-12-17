import { Entity, Column, Unique, Index } from "typeorm";
import { BaseAuditColumns } from "./base-audit-columns.entity";

@Entity("categories")
@Unique(["name"])
@Index(["name"])
export class Category extends BaseAuditColumns {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar", nullable: true })
  description: string;
}
