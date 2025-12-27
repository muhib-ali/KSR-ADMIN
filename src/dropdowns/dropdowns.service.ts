import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../entities/role.entity";
import { Module } from "../entities/module.entity";
import { Category } from "../entities/category.entity";
import { Brand } from "../entities/brand.entity";
import { Tax } from "../entities/tax.entity";
import { Supplier } from "../entities/supplier.entity";
import { Warehouse } from "../entities/warehouse.entity";
import { VariantType } from "../entities/variant-type.entity";
import { ResponseHelper } from "../common/helpers/response.helper";
import { ApiResponse } from "../common/interfaces/api-response.interface";

@Injectable()
export class DropdownsService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(Tax)
    private taxRepository: Repository<Tax>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(VariantType)
    private variantTypeRepository: Repository<VariantType>
  ) {}

  async getAllRoles(): Promise<ApiResponse<any>> {
    const roles = await this.roleRepository.find({
      where: { is_active: true },
      select: ["id", "title"],
      order: { title: "ASC" },
    });

    const rolesDropdown = roles.map((role) => ({
      label: role.title,
      value: role.id,
    }));

    return ResponseHelper.success(
      { rolesDropdown },
      "Roles dropdown data retrieved successfully",
      "Dropdowns"
    );
  }

  async getAllModules(): Promise<ApiResponse<any>> {
    const modules = await this.moduleRepository.find({
      where: { is_active: true },
      select: ["id", "title"],
      order: { title: "ASC" },
    });

    const modulesDropdown = modules.map((module) => ({
      label: module.title,
      value: module.id,
    }));

    return ResponseHelper.success(
      { modulesDropdown },
      "Modules dropdown data retrieved successfully",
      "Dropdowns"
    );
  }

  async getAllCategories(): Promise<ApiResponse<any>> {
    const categories = await this.categoryRepository.find({
      where: { is_active: true },
      select: ["id", "name"],
      order: { name: "ASC" },
    });

    const categoriesDropdown = categories.map((category) => ({
      label: category.name,
      value: category.id,
    }));

    return ResponseHelper.success(
      { categoriesDropdown },
      "Categories dropdown data retrieved successfully",
      "Dropdowns"
    );
  }

  async getAllBrands(): Promise<ApiResponse<any>> {
    const brands = await this.brandRepository.find({
      where: { is_active: true },
      select: ["id", "name"],
      order: { name: "ASC" },
    });

    const brandsDropdown = brands.map((brand) => ({
      label: brand.name,
      value: brand.id,
    }));

    return ResponseHelper.success(
      { brandsDropdown },
      "Brands dropdown data retrieved successfully",
      "Dropdowns"
    );
  }

  async getAllTaxes(): Promise<ApiResponse<any>> {
    const taxes = await this.taxRepository.find({
      where: { is_active: true },
      select: ["id", "title"],
      order: { title: "ASC" },
    });

    const taxesDropdown = taxes.map((tax) => ({
      label: tax.title,
      value: tax.id,
    }));

    return ResponseHelper.success(
      { taxesDropdown },
      "Taxes dropdown data retrieved successfully",
      "Dropdowns"
    );
  }

  async getAllSuppliers(): Promise<ApiResponse<any>> {
    const suppliers = await this.supplierRepository.find({
      where: { is_active: true },
      select: ["id", "supplier_name"],
      order: { supplier_name: "ASC" },
    });

    const suppliersDropdown = suppliers.map((supplier) => ({
      label: supplier.supplier_name,
      value: supplier.id,
    }));

    return ResponseHelper.success(
      { suppliersDropdown },
      "Suppliers dropdown data retrieved successfully",
      "Dropdowns"
    );
  }

  async getAllWarehouses(): Promise<ApiResponse<any>> {
    const warehouses = await this.warehouseRepository.find({
      where: { is_active: true },
      select: ["id", "name"],
      order: { name: "ASC" },
    });

    const warehousesDropdown = warehouses.map((warehouse) => ({
      label: warehouse.name,
      value: warehouse.id,
    }));

    return ResponseHelper.success(
      { warehousesDropdown },
      "Warehouses dropdown data retrieved successfully",
      "Dropdowns"
    );
  }

  async getAllVariantTypes(): Promise<ApiResponse<any>> {
    const variantTypes = await this.variantTypeRepository.find({
      where: { is_active: true },
      select: ["id", "name"],
      order: { name: "ASC" },
    });

    const variantTypesDropdown = variantTypes.map((variantType) => ({
      label: variantType.name,
      value: variantType.id,
    }));

    return ResponseHelper.success(
      { variantTypesDropdown },
      "Variant types dropdown data retrieved successfully",
      "Dropdowns"
    );
  }
}
