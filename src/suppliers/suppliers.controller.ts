import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { SuppliersService } from "./suppliers.service";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { DeleteSupplierDto } from "./dto/delete-supplier.dto";
import {
  SupplierResponseDto,
} from "./dto/supplier-response.dto";
import { SuppliersListResponseDto } from "./dto/suppliers-list-response.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { SearchPaginationDto } from "../common/dto/search-pagination.dto";

@ApiTags("Suppliers")
@ApiBearerAuth("JWT-auth")
@Controller("suppliers")
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Post("create")
  @ApiOperation({ summary: "Create new supplier" })
  @ApiResponse({
    status: 201,
    description: "Supplier created successfully",
    type: SupplierResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Supplier with name already exists",
    schema: {
      example: {
        statusCode: 400,
        status: false,
        message: "Supplier with this name already exists",
        heading: "Supplier",
        data: null,
      },
    },
  })
  @ApiBody({ type: CreateSupplierDto })
  async create(@Body(ValidationPipe) createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Put("update")
  @ApiOperation({ summary: "Update supplier" })
  @ApiResponse({
    status: 200,
    description: "Supplier updated successfully",
    type: SupplierResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Supplier not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Supplier not found",
        heading: "Supplier",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Supplier with name already exists",
    schema: {
      example: {
        statusCode: 400,
        status: false,
        message: "Supplier with this name already exists",
        heading: "Supplier",
        data: null,
      },
    },
  })
  @ApiBody({ type: UpdateSupplierDto })
  async update(@Body(ValidationPipe) updateSupplierDto: UpdateSupplierDto) {
    return this.suppliersService.update(updateSupplierDto);
  }

  @Get("getById/:id")
  @ApiOperation({ summary: "Get supplier by ID" })
  @ApiResponse({
    status: 200,
    description: "Supplier retrieved successfully",
    type: SupplierResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Supplier not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Supplier not found",
        heading: "Supplier",
        data: null,
      },
    },
  })
  @ApiParam({ name: "id", description: "Supplier ID", type: "string" })
  async getById(@Param("id") id: string) {
    return this.suppliersService.getById(id);
  }

  @Get("getAll")
  @ApiOperation({ summary: "Get all suppliers with pagination" })
  @ApiResponse({
    status: 200,
    description: "Suppliers retrieved successfully",
    type: SuppliersListResponseDto,
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page",
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    description: "Search by name/email",
  })
  async getAll(@Query(ValidationPipe) queryDto: SearchPaginationDto) {
    return this.suppliersService.getAll(queryDto, queryDto.search);
  }

  @Delete("delete")
  @ApiOperation({ summary: "Delete supplier" })
  @ApiResponse({
    status: 200,
    description: "Supplier deleted successfully",
    schema: {
      example: {
        statusCode: 200,
        status: true,
        message: "Supplier deleted successfully",
        heading: "Supplier",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Supplier not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Supplier not found",
        heading: "Supplier",
        data: null,
      },
    },
  })
  @ApiBody({ type: DeleteSupplierDto })
  async delete(@Body(ValidationPipe) deleteSupplierDto: DeleteSupplierDto) {
    return this.suppliersService.delete(deleteSupplierDto);
  }
}
