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
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { DeleteCategoryDto } from "./dto/delete-category.dto";
import {
  CategoryResponseDto,
  CategoriesListResponseDto,
} from "./dto/category-response.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { SearchPaginationDto } from "../common/dto/search-pagination.dto";

@ApiTags("Categories")
@ApiBearerAuth("JWT-auth")
@Controller("categories")
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post("create")
  @ApiOperation({ summary: "Create new category" })
  @ApiResponse({
    status: 201,
    description: "Category created successfully",
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Category with name already exists",
    schema: {
      example: {
        statusCode: 400,
        status: false,
        message: "Category with this name already exists",
        heading: "Category",
        data: null,
      },
    },
  })
  @ApiBody({ type: CreateCategoryDto })
  async create(@Body(ValidationPipe) createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Put("update")
  @ApiOperation({ summary: "Update category" })
  @ApiResponse({
    status: 200,
    description: "Category updated successfully",
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Category not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Category not found",
        heading: "Category",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Category with name already exists",
    schema: {
      example: {
        statusCode: 400,
        status: false,
        message: "Category with this name already exists",
        heading: "Category",
        data: null,
      },
    },
  })
  @ApiBody({ type: UpdateCategoryDto })
  async update(@Body(ValidationPipe) updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(updateCategoryDto);
  }

  @Get("getById/:id")
  @ApiOperation({ summary: "Get category by ID" })
  @ApiResponse({
    status: 200,
    description: "Category retrieved successfully",
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Category not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Category not found",
        heading: "Category",
        data: null,
      },
    },
  })
  @ApiParam({ name: "id", description: "Category ID", type: "string" })
  async getById(@Param("id") id: string) {
    return this.categoriesService.getById(id);
  }

  @Get("getAll")
  @ApiOperation({ summary: "Get all categories with pagination" })
  @ApiResponse({
    status: 200,
    description: "Categories retrieved successfully",
    type: CategoriesListResponseDto,
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
    return this.categoriesService.getAll(queryDto, queryDto.search);
  }

  @Delete("delete")
  @ApiOperation({ summary: "Delete category" })
  @ApiResponse({
    status: 200,
    description: "Category deleted successfully",
    schema: {
      example: {
        statusCode: 200,
        status: true,
        message: "Category deleted successfully",
        heading: "Category",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Category not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Category not found",
        heading: "Category",
        data: null,
      },
    },
  })
  @ApiBody({ type: DeleteCategoryDto })
  async delete(@Body(ValidationPipe) deleteCategoryDto: DeleteCategoryDto) {
    return this.categoriesService.delete(deleteCategoryDto);
  }
}
