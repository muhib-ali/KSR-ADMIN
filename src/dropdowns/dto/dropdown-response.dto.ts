import { ApiProperty } from "@nestjs/swagger";

export class DropdownItemDto {
  @ApiProperty({
    description: "Display label for dropdown",
    example: "Platform Admin",
  })
  label: string;

  @ApiProperty({
    description: "Value for dropdown item",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  value: string;
}

export class RolesDropdownDataDto {
  @ApiProperty({
    type: [DropdownItemDto],
    description: "Array of roles for dropdown",
  })
  rolesDropdown: DropdownItemDto[];
}

export class ModulesDropdownDataDto {
  @ApiProperty({
    type: [DropdownItemDto],
    description: "Array of modules for dropdown",
  })
  modulesDropdown: DropdownItemDto[];
}

export class CategoriesDropdownDataDto {
  @ApiProperty({
    type: [DropdownItemDto],
    description: "Array of categories for dropdown",
  })
  categoriesDropdown: DropdownItemDto[];
}

export class BrandsDropdownDataDto {
  @ApiProperty({
    type: [DropdownItemDto],
    description: "Array of brands for dropdown",
  })
  brandsDropdown: DropdownItemDto[];
}

export class TaxesDropdownDataDto {
  @ApiProperty({
    type: [DropdownItemDto],
    description: "Array of taxes for dropdown",
  })
  taxesDropdown: DropdownItemDto[];
}

export class SuppliersDropdownDataDto {
  @ApiProperty({
    type: [DropdownItemDto],
    description: "Array of suppliers for dropdown",
  })
  suppliersDropdown: DropdownItemDto[];
}

export class WarehousesDropdownDataDto {
  @ApiProperty({
    type: [DropdownItemDto],
    description: "Array of warehouses for dropdown",
  })
  warehousesDropdown: DropdownItemDto[];
}

export class VariantTypesDropdownDataDto {
  @ApiProperty({
    type: [DropdownItemDto],
    description: "Array of variant types for dropdown",
  })
  variantTypesDropdown: DropdownItemDto[];
}

export class CustomerVisibilityGroupsDropdownDataDto {
  @ApiProperty({
    type: [DropdownItemDto],
    description: "Array of customer visibility groups for dropdown",
  })
  customerVisibilityGroupsDropdown: DropdownItemDto[];
}

export class RolesDropdownResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: "Roles dropdown data retrieved successfully" })
  message: string;

  @ApiProperty({ example: "Dropdowns" })
  heading: string;

  @ApiProperty({ type: RolesDropdownDataDto })
  data: RolesDropdownDataDto;
}

export class ModulesDropdownResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: "Modules dropdown data retrieved successfully" })
  message: string;

  @ApiProperty({ example: "Dropdowns" })
  heading: string;

  @ApiProperty({ type: ModulesDropdownDataDto })
  data: ModulesDropdownDataDto;
}

export class CategoriesDropdownResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: "Categories dropdown data retrieved successfully" })
  message: string;

  @ApiProperty({ example: "Dropdowns" })
  heading: string;

  @ApiProperty({ type: CategoriesDropdownDataDto })
  data: CategoriesDropdownDataDto;
}

export class BrandsDropdownResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: "Brands dropdown data retrieved successfully" })
  message: string;

  @ApiProperty({ example: "Dropdowns" })
  heading: string;

  @ApiProperty({ type: BrandsDropdownDataDto })
  data: BrandsDropdownDataDto;
}

export class TaxesDropdownResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: "Taxes dropdown data retrieved successfully" })
  message: string;

  @ApiProperty({ example: "Dropdowns" })
  heading: string;

  @ApiProperty({ type: TaxesDropdownDataDto })
  data: TaxesDropdownDataDto;
}

export class SuppliersDropdownResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: "Suppliers dropdown data retrieved successfully" })
  message: string;

  @ApiProperty({ example: "Dropdowns" })
  heading: string;

  @ApiProperty({ type: SuppliersDropdownDataDto })
  data: SuppliersDropdownDataDto;
}

export class WarehousesDropdownResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: "Warehouses dropdown data retrieved successfully" })
  message: string;

  @ApiProperty({ example: "Dropdowns" })
  heading: string;

  @ApiProperty({ type: WarehousesDropdownDataDto })
  data: WarehousesDropdownDataDto;
}

export class VariantTypesDropdownResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: "Variant types dropdown data retrieved successfully" })
  message: string;

  @ApiProperty({ example: "Dropdowns" })
  heading: string;

  @ApiProperty({ type: VariantTypesDropdownDataDto })
  data: VariantTypesDropdownDataDto;
}

export class CustomerVisibilityGroupsDropdownResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: "Customer visibility groups dropdown data retrieved successfully" })
  message: string;

  @ApiProperty({ example: "Dropdowns" })
  heading: string;

  @ApiProperty({ type: CustomerVisibilityGroupsDropdownDataDto })
  data: CustomerVisibilityGroupsDropdownDataDto;
}
