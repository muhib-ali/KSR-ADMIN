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
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { DeleteProductDto } from "./dto/delete-product.dto";
import {
  ProductResponseDto,
  ProductsListResponseDto,
} from "./dto/product-response.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { SearchPaginationDto } from "../common/dto/search-pagination.dto";

@ApiTags("Products")
@ApiBearerAuth("JWT-auth")
@Controller("products")
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post("create")
  @ApiOperation({ summary: "Create new product" })
  @ApiResponse({
    status: 201,
    description: "Product created successfully",
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Category/Brand not found or invalid data",
    schema: {
      example: {
        statusCode: 400,
        status: false,
        message: "Category not found",
        heading: "Product",
        data: null,
      },
    },
  })
  @ApiBody({ type: CreateProductDto })
  async create(@Body(ValidationPipe) createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put("update")
  @ApiOperation({ summary: "Update product" })
  @ApiResponse({
    status: 200,
    description: "Product updated successfully",
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Product not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Product not found",
        heading: "Product",
        data: null,
      },
    },
  })
  @ApiBody({ type: UpdateProductDto })
  async update(@Body(ValidationPipe) updateProductDto: UpdateProductDto) {
    return this.productsService.update(updateProductDto);
  }

  @Get("getById/:id")
  @ApiOperation({ summary: "Get product by ID" })
  @ApiResponse({
    status: 200,
    description: "Product retrieved successfully",
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Product not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Product not found",
        heading: "Product",
        data: null,
      },
    },
  })
  @ApiParam({ name: "id", description: "Product ID", type: "string" })
  async getById(@Param("id") id: string) {
    return this.productsService.getById(id);
  }

  @Get("getAll")
  @ApiOperation({ summary: "Get all products with pagination" })
  @ApiResponse({
    status: 200,
    description: "Products retrieved successfully",
    type: ProductsListResponseDto,
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
    description: "Search by title/sku/currency/category/brand",
  })
  async getAll(@Query(ValidationPipe) queryDto: SearchPaginationDto) {
    return this.productsService.getAll(queryDto, queryDto.search);
  }

  @Delete("delete")
  @ApiOperation({ summary: "Delete product" })
  @ApiResponse({
    status: 200,
    description: "Product deleted successfully",
    schema: {
      example: {
        statusCode: 200,
        status: true,
        message: "Product deleted successfully",
        heading: "Product",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Product not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Product not found",
        heading: "Product",
        data: null,
      },
    },
  })
  @ApiBody({ type: DeleteProductDto })
  async delete(@Body(ValidationPipe) deleteProductDto: DeleteProductDto) {
    return this.productsService.delete(deleteProductDto);
  }
}
