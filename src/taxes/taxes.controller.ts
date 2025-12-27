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
import { TaxesService } from "./taxes.service";
import { CreateTaxDto } from "./dto/create-tax.dto";
import { UpdateTaxDto } from "./dto/update-tax.dto";
import { DeleteTaxDto } from "./dto/delete-tax.dto";
import {
  TaxResponseDto,
} from "./dto/tax-response.dto";
import { TaxesListResponseDto } from "./dto/taxes-list-response.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { SearchPaginationDto } from "../common/dto/search-pagination.dto";

@ApiTags("Taxes")
@ApiBearerAuth("JWT-auth")
@Controller("taxes")
export class TaxesController {
  constructor(private taxesService: TaxesService) {}

  @Post("create")
  @ApiOperation({ summary: "Create new tax" })
  @ApiResponse({
    status: 201,
    description: "Tax created successfully",
    type: TaxResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Tax with title already exists",
    schema: {
      example: {
        statusCode: 400,
        status: false,
        message: "Tax with this title already exists",
        heading: "Tax",
        data: null,
      },
    },
  })
  @ApiBody({ type: CreateTaxDto })
  async create(@Body(ValidationPipe) createTaxDto: CreateTaxDto) {
    return this.taxesService.create(createTaxDto);
  }

  @Put("update")
  @ApiOperation({ summary: "Update tax" })
  @ApiResponse({
    status: 200,
    description: "Tax updated successfully",
    type: TaxResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Tax not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Tax not found",
        heading: "Tax",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Tax with title already exists",
    schema: {
      example: {
        statusCode: 400,
        status: false,
        message: "Tax with this title already exists",
        heading: "Tax",
        data: null,
      },
    },
  })
  @ApiBody({ type: UpdateTaxDto })
  async update(@Body(ValidationPipe) updateTaxDto: UpdateTaxDto) {
    return this.taxesService.update(updateTaxDto);
  }

  @Get("getById/:id")
  @ApiOperation({ summary: "Get tax by ID" })
  @ApiResponse({
    status: 200,
    description: "Tax retrieved successfully",
    type: TaxResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Tax not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Tax not found",
        heading: "Tax",
        data: null,
      },
    },
  })
  @ApiParam({ name: "id", description: "Tax ID", type: "string" })
  async getById(@Param("id") id: string) {
    return this.taxesService.getById(id);
  }

  @Get("getAll")
  @ApiOperation({ summary: "Get all taxes with pagination" })
  @ApiResponse({
    status: 200,
    description: "Taxes retrieved successfully",
    type: TaxesListResponseDto,
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
    description: "Search by title",
  })
  async getAll(@Query(ValidationPipe) queryDto: SearchPaginationDto) {
    return this.taxesService.getAll(queryDto, queryDto.search);
  }

  @Delete("delete")
  @ApiOperation({ summary: "Delete tax" })
  @ApiResponse({
    status: 200,
    description: "Tax deleted successfully",
    schema: {
      example: {
        statusCode: 200,
        status: true,
        message: "Tax deleted successfully",
        heading: "Tax",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Tax not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Tax not found",
        heading: "Tax",
        data: null,
      },
    },
  })
  @ApiBody({ type: DeleteTaxDto })
  async delete(@Body(ValidationPipe) deleteTaxDto: DeleteTaxDto) {
    return this.taxesService.delete(deleteTaxDto);
  }
}
