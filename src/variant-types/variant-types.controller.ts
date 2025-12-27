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
import { VariantTypesService } from "./variant-types.service";
import { CreateVariantTypeDto } from "./dto/create-variant-type.dto";
import { UpdateVariantTypeDto } from "./dto/update-variant-type.dto";
import { DeleteVariantTypeDto } from "./dto/delete-variant-type.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { SearchPaginationDto } from "../common/dto/search-pagination.dto";
import {
  VariantTypeResponseDto,
  VariantTypesListResponseDto,
} from "./dto/variant-type-response.dto";

@ApiTags("Variant Types")
@ApiBearerAuth("JWT-auth")
@Controller("variant-types")
export class VariantTypesController {
  constructor(private variantTypesService: VariantTypesService) {}

  @Post("create")
  @ApiOperation({ summary: "Create new variant type" })
  @ApiResponse({
    status: 201,
    description: "Variant type created successfully",
    type: VariantTypeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Variant type name already exists or invalid data",
    schema: {
      example: {
        statusCode: 400,
        status: false,
        message: "Variant type name already exists",
        heading: "VariantType",
        data: null,
      },
    },
  })
  @ApiBody({ type: CreateVariantTypeDto })
  async create(@Body(ValidationPipe) createVariantTypeDto: CreateVariantTypeDto) {
    return this.variantTypesService.create(createVariantTypeDto);
  }

  @Put("update")
  @ApiOperation({ summary: "Update variant type" })
  @ApiResponse({
    status: 200,
    description: "Variant type updated successfully",
    type: VariantTypeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Variant type not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Variant type not found",
        heading: "VariantType",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Variant type name already exists",
    schema: {
      example: {
        statusCode: 400,
        status: false,
        message: "Variant type name already exists",
        heading: "VariantType",
        data: null,
      },
    },
  })
  @ApiBody({ type: UpdateVariantTypeDto })
  async update(@Body(ValidationPipe) updateVariantTypeDto: UpdateVariantTypeDto) {
    return this.variantTypesService.update(updateVariantTypeDto);
  }

  @Get("getById/:id")
  @ApiOperation({ summary: "Get variant type by ID" })
  @ApiResponse({
    status: 200,
    description: "Variant type retrieved successfully",
    type: VariantTypeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Variant type not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Variant type not found",
        heading: "VariantType",
        data: null,
      },
    },
  })
  @ApiParam({ name: "id", description: "Variant type ID", type: "string" })
  async getById(@Param("id") id: string) {
    return this.variantTypesService.getById(id);
  }

  @Get("getAll")
  @ApiOperation({ summary: "Get all variant types with pagination" })
  @ApiResponse({
    status: 200,
    description: "Variant types retrieved successfully",
    type: VariantTypesListResponseDto,
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
    description: "Search by variant type name",
  })
  async getAll(@Query(ValidationPipe) queryDto: SearchPaginationDto) {
    return this.variantTypesService.getAll(queryDto);
  }

  @Delete("delete")
  @ApiOperation({ summary: "Delete variant type" })
  @ApiResponse({
    status: 200,
    description: "Variant type deleted successfully",
    schema: {
      example: {
        statusCode: 200,
        status: true,
        message: "Variant type deleted successfully",
        heading: "VariantType",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Variant type not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Variant type not found",
        heading: "VariantType",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Cannot delete variant type being used by variants",
    schema: {
      example: {
        statusCode: 400,
        status: false,
        message: "Cannot delete variant type. It is being used by variants. Please delete the variants first.",
        heading: "VariantType",
        data: null,
      },
    },
  })
  @ApiBody({ type: DeleteVariantTypeDto })
  async delete(@Body(ValidationPipe) deleteVariantTypeDto: DeleteVariantTypeDto) {
    return this.variantTypesService.delete(deleteVariantTypeDto);
  }
}
