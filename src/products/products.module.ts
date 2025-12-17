import { Module as NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { Product } from "../entities/product.entity";
import { Category } from "../entities/category.entity";
import { Brand } from "../entities/brand.entity";

@NestModule({
  imports: [TypeOrmModule.forFeature([Product, Category, Brand])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
