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
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import {
  FileInterceptor,
  AnyFilesInterceptor,
} from "@nestjs/platform-express";
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

type UploadedVideoFile = {
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

  @Get("images/:productId")
  @ApiOperation({ summary: "Get product images" })
  @ApiParam({ name: "productId", description: "Product ID", type: String })
  async getImages(@Param("productId") productId: string) {
    return this.productsService.getImages(productId);
  }

  @Post("images/:productId")
  @ApiOperation({ summary: "Upload product images (max 5)" })
  @ApiConsumes("multipart/form-data")
  @ApiParam({ name: "productId", description: "Product ID", type: String })
  @ApiBody({
    schema: {
      type: "object",
      required: ["files"],
      properties: {
        files: { type: "array", items: { type: "string", format: "binary" } },
      },
    },
  })
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5,
      },
      fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.mimetype)) {
          return cb(
            new Error("Only jpeg, png, webp images are allowed"),
            false
          );
        }
        cb(null, true);
      },
    })
  )
  async uploadImages(
    @Req() req: Request,
    @Param("productId") productId: string,
    @UploadedFiles() files: UploadedImageFile[]
  ) {
    const list = (files || []).map((f) => ({
      buffer: f.buffer,
      mimetype: f.mimetype,
      originalname: f.originalname,
    }));
    return this.productsService.uploadImages(
      productId,
      list,
      req.headers.authorization
    );
  }

  @Post("video/:productId")
  @ApiOperation({ summary: "Upload product video" })
  @ApiConsumes("multipart/form-data")
  @ApiParam({ name: "productId", description: "Product ID", type: String })
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
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB for video
      },
      fileFilter: (req, file, cb) => {
        const allowed = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
        if (!allowed.includes(file.mimetype)) {
          return cb(
            new Error("Only mp4, webm, ogg, quicktime videos are allowed"),
            false
          );
        }
        cb(null, true);
      },
    })
  )
  async uploadVideo(
    @Req() req: Request,
    @Param("productId") productId: string,
    @UploadedFile() file: UploadedVideoFile
  ) {
    if (!file) {
      throw new BadRequestException("Video file is required");
    }

    return this.productsService.uploadVideo(
      productId,
      file,
      req.headers.authorization
    );
  }

  @Delete("images/:productId/:imageId")
  @ApiOperation({ summary: "Delete a product image" })
  @ApiParam({ name: "productId", description: "Product ID", type: String })
  @ApiParam({ name: "imageId", description: "Product image ID", type: String })
  async deleteImage(
    @Req() req: Request,
    @Param("productId") productId: string,
    @Param("imageId") imageId: string
  ) {
    return this.productsService.deleteImage(
      productId,
      imageId,
      req.headers.authorization
    );
  }

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
