import { Controller, Get } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { DropdownsService } from "./dropdowns.service";
import {
  RolesDropdownResponseDto,
  ModulesDropdownResponseDto,
  CategoriesDropdownResponseDto,
  BrandsDropdownResponseDto,
  TaxesDropdownResponseDto,
  SuppliersDropdownResponseDto,
  WarehousesDropdownResponseDto,
  VariantTypesDropdownResponseDto,
} from "./dto/dropdown-response.dto";

@ApiTags("Dropdowns")
@ApiBearerAuth("JWT-auth")
@Controller("dropdowns")
export class DropdownsController {
  constructor(private dropdownsService: DropdownsService) {}

  @Get("getAllRoles")
  @ApiOperation({ summary: "Get all active roles for dropdown" })
  @ApiResponse({
    status: 200,
    description: "Roles dropdown data retrieved successfully",
    type: RolesDropdownResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAllRoles() {
    return this.dropdownsService.getAllRoles();
  }

  @Get("getAllModules")
  @ApiOperation({ summary: "Get all active modules for dropdown" })
  @ApiResponse({
    status: 200,
    description: "Modules dropdown data retrieved successfully",
    type: ModulesDropdownResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAllModules() {
    return this.dropdownsService.getAllModules();
  }

  @Get("getAllCategories")
  @ApiOperation({ summary: "Get all active categories for dropdown" })
  @ApiResponse({
    status: 200,
    description: "Categories dropdown data retrieved successfully",
    type: CategoriesDropdownResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAllCategories() {
    return this.dropdownsService.getAllCategories();
  }

  @Get("getAllBrands")
  @ApiOperation({ summary: "Get all active brands for dropdown" })
  @ApiResponse({
    status: 200,
    description: "Brands dropdown data retrieved successfully",
    type: BrandsDropdownResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAllBrands() {
    return this.dropdownsService.getAllBrands();
  }

  @Get("getAllTaxes")
  @ApiOperation({ summary: "Get all active taxes for dropdown" })
  @ApiResponse({
    status: 200,
    description: "Taxes dropdown data retrieved successfully",
    type: TaxesDropdownResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAllTaxes() {
    return this.dropdownsService.getAllTaxes();
  }

  @Get("getAllSuppliers")
  @ApiOperation({ summary: "Get all active suppliers for dropdown" })
  @ApiResponse({
    status: 200,
    description: "Suppliers dropdown data retrieved successfully",
    type: SuppliersDropdownResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAllSuppliers() {
    return this.dropdownsService.getAllSuppliers();
  }

  @Get("getAllWarehouses")
  @ApiOperation({ summary: "Get all active warehouses for dropdown" })
  @ApiResponse({
    status: 200,
    description: "Warehouses dropdown data retrieved successfully",
    type: WarehousesDropdownResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAllWarehouses() {
    return this.dropdownsService.getAllWarehouses();
  }

  @Get("getAllVariantTypes")
  @ApiOperation({ summary: "Get all active variant types for dropdown" })
  @ApiResponse({
    status: 200,
    description: "Variant types dropdown data retrieved successfully",
    type: VariantTypesDropdownResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAllVariantTypes() {
    return this.dropdownsService.getAllVariantTypes();
  }
}
