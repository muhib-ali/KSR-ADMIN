import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
  Index,
} from "typeorm";
import { BaseAuditColumns } from "./base-audit-columns.entity";
import { Category } from "./category.entity";
import { Brand } from "./brand.entity";
import { ProductImage } from "./product-image.entity";
import { Tax } from "./tax.entity";
import { Supplier } from "./supplier.entity";
import { Warehouse } from "./warehouse.entity";
import { Variant } from "./variant.entity";
import { CvgProduct } from "./cvg-product.entity";
import { BulkPrice } from "./bulk-price.entity";

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

  @Column({ type: "numeric", nullable: true })
  cost: number;

  @Column({ type: "numeric", nullable: true })
  freight: number;

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

  @Column({ type: "varchar", length: 512, nullable: true })
  product_video_url: string;

  @Column({ type: "varchar" })
  sku: string;

  @Column({ type: "uuid", nullable: true })
  tax_id: string;

  @Column({ type: "uuid", nullable: true })
  supplier_id: string;

  @Column({ type: "uuid", nullable: true })
  warehouse_id: string;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  discount: number;

  @Column({ type: "timestamp", nullable: true })
  start_discount_date: Date;

  @Column({ type: "timestamp", nullable: true })
  end_discount_date: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  length: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  width: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  height: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  weight: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total_price: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category_id" })
  category: Category;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: "brand_id" })
  brand: Brand;

  @ManyToOne(() => Tax)
  @JoinColumn({ name: "tax_id" })
  tax: Tax;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: "supplier_id" })
  supplier: Supplier;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: "warehouse_id" })
  warehouse: Warehouse;

  @OneToMany(() => ProductImage, (img) => img.product)
  images: ProductImage[];

  @OneToMany(() => Variant, (variant) => variant.product)
  variants: Variant[];

  @OneToMany(() => CvgProduct, (cvgProduct) => cvgProduct.product)
  cvgProducts: CvgProduct[];

  @OneToMany(() => BulkPrice, (bulkPrice) => bulkPrice.product)
  bulkPrices: BulkPrice[];
}
