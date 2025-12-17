import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from "typeorm";
import { BaseAuditColumns } from "./base-audit-columns.entity";
import { Category } from "./category.entity";
import { Brand } from "./brand.entity";

@Entity("products")
@Unique(["sku"])
@Index(["sku"])
export class Product extends BaseAuditColumns {
  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "varchar", nullable: true })
  description: string;

  @Column({ type: "numeric" })
  price: number;

  @Column({ type: "int" })
  stock_quantity: number;

  @Column({ type: "uuid" })
  category_id: string;

  @Column({ type: "uuid" })
  brand_id: string;

  @Column({ type: "varchar" })
  currency: string;

  @Column({ type: "varchar", nullable: true })
  product_img_url: string;

  @Column({ type: "varchar" })
  sku: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category_id" })
  category: Category;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: "brand_id" })
  brand: Brand;
}
