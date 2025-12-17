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
import { BrandsService } from "./brands.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { DeleteBrandDto } from "./dto/delete-brand.dto";
import {
  BrandResponseDto,
  BrandsListResponseDto,
} from "./dto/brand-response.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { SearchPaginationDto } from "../common/dto/search-pagination.dto";

@ApiTags("Brands")
@ApiBearerAuth("JWT-auth")
@Controller("brands")
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  @Post("create")
  @ApiOperation({ summary: "Create new brand" })
  @ApiResponse({
    status: 201,
    description: "Brand created successfully",
    type: BrandResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Brand with name already exists",
    schema: {
      example: {
        statusCode: 400,
        status: false,
        message: "Brand with this name already exists",
        heading: "Brand",
        data: null,
      },
    },
  })
  @ApiBody({ type: CreateBrandDto })
  async create(@Body(ValidationPipe) createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Put("update")
  @ApiOperation({ summary: "Update brand" })
  @ApiResponse({
    status: 200,
    description: "Brand updated successfully",
    type: BrandResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Brand not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Brand not found",
        heading: "Brand",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Brand with name already exists",
    schema: {
      example: {
        statusCode: 400,
        status: false,
        message: "Brand with this name already exists",
        heading: "Brand",
        data: null,
      },
    },
  })
  @ApiBody({ type: UpdateBrandDto })
  async update(@Body(ValidationPipe) updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(updateBrandDto);
  }

  @Get("getById/:id")
  @ApiOperation({ summary: "Get brand by ID" })
  @ApiResponse({
    status: 200,
    description: "Brand retrieved successfully",
    type: BrandResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Brand not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Brand not found",
        heading: "Brand",
        data: null,
      },
    },
  })
  @ApiParam({ name: "id", description: "Brand ID", type: "string" })
  async getById(@Param("id") id: string) {
    return this.brandsService.getById(id);
  }

  @Get("getAll")
  @ApiOperation({ summary: "Get all brands with pagination" })
  @ApiResponse({
    status: 200,
    description: "Brands retrieved successfully",
    type: BrandsListResponseDto,
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
    description: "Search by name/description",
  })
  async getAll(@Query(ValidationPipe) queryDto: SearchPaginationDto) {
    return this.brandsService.getAll(queryDto, queryDto.search);
  }

  @Delete("delete")
  @ApiOperation({ summary: "Delete brand" })
  @ApiResponse({
    status: 200,
    description: "Brand deleted successfully",
    schema: {
      example: {
        statusCode: 200,
        status: true,
        message: "Brand deleted successfully",
        heading: "Brand",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Brand not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Brand not found",
        heading: "Brand",
        data: null,
      },
    },
  })
  @ApiBody({ type: DeleteBrandDto })
  async delete(@Body(ValidationPipe) deleteBrandDto: DeleteBrandDto) {
    return this.brandsService.delete(deleteBrandDto);
  }
}
