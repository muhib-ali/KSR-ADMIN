import { Module as NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { Product } from "../entities/product.entity";
import { ProductImage } from "../entities/product-image.entity";
import { Category } from "../entities/category.entity";
import { Brand } from "../entities/brand.entity";
import { Variant } from "../entities/variant.entity";
import { VariantType } from "../entities/variant-type.entity";
import { CvgProduct } from "../entities/cvg-product.entity";
import { BulkPrice } from "../entities/bulk-price.entity";
import { CustomerVisibilityGroup } from "../entities/customer-visibility-group.entity";
import { Tax } from "../entities/tax.entity";
import { Supplier } from "../entities/supplier.entity";
import { Warehouse } from "../entities/warehouse.entity";

@NestModule({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, Category, Brand, Variant, VariantType, CvgProduct, BulkPrice, CustomerVisibilityGroup, Tax, Supplier, Warehouse])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
