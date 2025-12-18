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

type UploadedExcelFile = {
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

  @Post("bulk-upload")
  @ApiOperation({ summary: "Bulk upload products via Excel (.xlsx/.xls)" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({
    status: 200,
    description: "Bulk upload processed",
    schema: {
      example: {
        statusCode: 200,
        status: true,
        message: "Bulk upload processed",
        heading: "Product",
        data: {
          totalRows: 50,
          processedRows: 50,
          createdCount: 45,
          failedCount: 5,
          failures: [
            {
              rowNumber: 7,
              reason: "Category title is required",
            },
          ],
        },
      },
    },
  })
  @ApiBody({
    schema: {
      type: "object",
      required: ["file"],
      properties: {
        file: { type: "string", format: "binary" },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ];

        const name = (file.originalname || "").toLowerCase();
        const okByExt = name.endsWith(".xlsx") || name.endsWith(".xls");
        const okByMime = allowedMimes.includes(file.mimetype);

        if (!okByExt && !okByMime) {
          return cb(new Error("Only .xlsx or .xls files are allowed"), false);
        }
        cb(null, true);
      },
    })
  )
  async bulkUpload(@Req() req: Request, @UploadedFile() file: UploadedExcelFile) {
    if (!file) {
      throw new BadRequestException("Excel file is required");
    }

    return this.productsService.bulkUploadFromExcel(file, req.headers.authorization);
  }

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
        product_img_url: {
          type: "string",
          example: "http://localhost:3003/public/products/your-file.webp",
        },
      },
    },
  })
  async create(@Req() req: Request, @Body(ValidationPipe) createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto, req.headers.authorization);
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
        product_img_url: {
          type: "string",
          example: "http://localhost:3003/public/products/your-file.webp",
        },
      },
    },
  })
  async update(@Req() req: Request, @Body(ValidationPipe) updateProductDto: UpdateProductDto) {
    return this.productsService.update(updateProductDto, req.headers.authorization);
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
