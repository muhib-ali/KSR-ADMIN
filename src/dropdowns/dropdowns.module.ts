import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DropdownsController } from "./dropdowns.controller";
import { DropdownsService } from "./dropdowns.service";
import { Role } from "../entities/role.entity";
import { Module as ModuleEntity } from "../entities/module.entity";
import { Category } from "../entities/category.entity";
import { Brand } from "../entities/brand.entity";
import { Tax } from "../entities/tax.entity";
import { Supplier } from "../entities/supplier.entity";
import { Warehouse } from "../entities/warehouse.entity";
import { VariantType } from "../entities/variant-type.entity";
import { CustomerVisibilityGroup } from "../entities/customer-visibility-group.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Role, ModuleEntity, Category, Brand, Tax, Supplier, Warehouse, VariantType, CustomerVisibilityGroup]), AuthModule],
  controllers: [DropdownsController],
  providers: [DropdownsService],
  exports: [DropdownsService],
})
export class DropdownsModule {}
