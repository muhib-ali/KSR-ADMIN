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
import { WarehousesService } from "./warehouses.service";
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto";
import { DeleteWarehouseDto } from "./dto/delete-warehouse.dto";
import { WarehouseResponseDto } from "./dto/warehouse-response.dto";
import { WarehousesListResponseDto } from "./dto/warehouses-list-response.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { SearchPaginationDto } from "../common/dto/search-pagination.dto";

@ApiTags("Warehouses")
@ApiBearerAuth("JWT-auth")
@Controller("warehouses")
export class WarehousesController {
  constructor(private warehousesService: WarehousesService) {}

  @Post("create")
  @ApiOperation({ summary: "Create new warehouse" })
  @ApiResponse({
    status: 201,
    description: "Warehouse created successfully",
    type: WarehouseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Warehouse with code already exists",
    schema: {
      example: {
        statusCode: 400,
        status: false,
        message: "Warehouse with this code already exists",
        heading: "Warehouse",
        data: null,
      },
    },
  })
  @ApiBody({ type: CreateWarehouseDto })
  async create(@Body(ValidationPipe) createWarehouseDto: CreateWarehouseDto) {
    return this.warehousesService.create(createWarehouseDto);
  }

  @Put("update")
  @ApiOperation({ summary: "Update warehouse" })
  @ApiResponse({
    status: 200,
    description: "Warehouse updated successfully",
    type: WarehouseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Warehouse not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Warehouse not found",
        heading: "Warehouse",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Warehouse with code already exists",
    schema: {
      example: {
        statusCode: 400,
        status: false,
        message: "Warehouse with this code already exists",
        heading: "Warehouse",
        data: null,
      },
    },
  })
  @ApiBody({ type: UpdateWarehouseDto })
  async update(@Body(ValidationPipe) updateWarehouseDto: UpdateWarehouseDto) {
    return this.warehousesService.update(updateWarehouseDto);
  }

  @Get("getById/:id")
  @ApiOperation({ summary: "Get warehouse by ID" })
  @ApiResponse({
    status: 200,
    description: "Warehouse retrieved successfully",
    type: WarehouseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Warehouse not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Warehouse not found",
        heading: "Warehouse",
        data: null,
      },
    },
  })
  @ApiParam({ name: "id", description: "Warehouse ID", type: "string" })
  async getById(@Param("id") id: string) {
    return this.warehousesService.getById(id);
  }

  @Get("getAll")
  @ApiOperation({ summary: "Get all warehouses with pagination" })
  @ApiResponse({
    status: 200,
    description: "Warehouses retrieved successfully",
    type: WarehousesListResponseDto,
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
    description: "Search by name/code",
  })
  async getAll(@Query(ValidationPipe) queryDto: SearchPaginationDto) {
    return this.warehousesService.getAll(queryDto, queryDto.search);
  }

  @Delete("delete")
  @ApiOperation({ summary: "Delete warehouse" })
  @ApiResponse({
    status: 200,
    description: "Warehouse deleted successfully",
    schema: {
      example: {
        statusCode: 200,
        status: true,
        message: "Warehouse deleted successfully",
        heading: "Warehouse",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Warehouse not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Warehouse not found",
        heading: "Warehouse",
        data: null,
      },
    },
  })
  @ApiBody({ type: DeleteWarehouseDto })
  async delete(@Body(ValidationPipe) deleteWarehouseDto: DeleteWarehouseDto) {
    return this.warehousesService.delete(deleteWarehouseDto);
  }
}
