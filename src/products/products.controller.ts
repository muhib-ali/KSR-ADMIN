import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  Req,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { Request } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiConsumes,
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

type UploadedImageFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

@ApiTags("Products")
@ApiBearerAuth("JWT-auth")
@Controller("products")
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post("create")
  @ApiOperation({ summary: "Create new product" })
  @ApiConsumes("multipart/form-data")
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
  @ApiBody({
    schema: {
      type: "object",
      required: [
        "title",
        "price",
        "stock_quantity",
        "category_id",
        "brand_id",
        "currency",
        "file",
      ],
      properties: {
        title: { type: "string", example: "Nike Air Max" },
        description: { type: "string", example: "Comfortable running shoes" },
        price: { type: "number", example: 199.99 },
        stock_quantity: { type: "integer", example: 50 },
        category_id: {
          type: "string",
          example: "123e4567-e89b-12d3-a456-426614174000",
        },
        brand_id: {
          type: "string",
          example: "123e4567-e89b-12d3-a456-426614174000",
        },
        currency: { type: "string", example: "USD" },
        file: { type: "string", format: "binary" },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.mimetype)) {
          return cb(new Error("Only jpeg, png, webp images are allowed"), false);
        }
        cb(null, true);
      },
    })
  )
  async create(
    @Req() req: Request,
    @Body(ValidationPipe) createProductDto: CreateProductDto,
    @UploadedFile() file: UploadedImageFile
  ) {
    if (!file) {
      throw new BadRequestException("Product image file is required");
    }
    return this.productsService.create(createProductDto, file, req.headers.authorization);
  }

  @Put("update")
  @ApiOperation({ summary: "Update product" })
  @ApiConsumes("multipart/form-data")
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
  @ApiBody({
    schema: {
      type: "object",
      required: [
        "id",
        "title",
        "price",
        "stock_quantity",
        "category_id",
        "brand_id",
        "currency",
      ],
      properties: {
        id: {
          type: "string",
          example: "123e4567-e89b-12d3-a456-426614174000",
        },
        title: { type: "string", example: "Nike Air Max" },
        description: { type: "string", example: "Comfortable running shoes" },
        price: { type: "number", example: 199.99 },
        stock_quantity: { type: "integer", example: 50 },
        category_id: {
          type: "string",
          example: "123e4567-e89b-12d3-a456-426614174000",
        },
        brand_id: {
          type: "string",
          example: "123e4567-e89b-12d3-a456-426614174000",
        },
        currency: { type: "string", example: "USD" },
        file: { type: "string", format: "binary" },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.mimetype)) {
          return cb(new Error("Only jpeg, png, webp images are allowed"), false);
        }
        cb(null, true);
      },
    })
  )
  async update(
    @Req() req: Request,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
    @UploadedFile() file?: UploadedImageFile
  ) {
    return this.productsService.update(updateProductDto, file, req.headers.authorization);
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
  async delete(
    @Req() req: Request,
    @Body(ValidationPipe) deleteProductDto: DeleteProductDto
  ) {
    return this.productsService.delete(deleteProductDto, req.headers.authorization);
  }
}
