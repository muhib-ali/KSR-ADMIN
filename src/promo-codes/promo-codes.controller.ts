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
import { PromoCodesService } from "./promo-codes.service";
import { CreatePromoCodeDto } from "./dto/create-promo-code.dto";
import { UpdatePromoCodeDto } from "./dto/update-promo-code.dto";
import { DeletePromoCodeDto } from "./dto/delete-promo-code.dto";
import {
  PromoCodeResponseDto,
  PromoCodesListResponseDto,
} from "./dto/promo-code-response.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { SearchPaginationDto } from "../common/dto/search-pagination.dto";

@ApiTags("Promo Codes")
@ApiBearerAuth("JWT-auth")
@Controller("promo-codes")
export class PromoCodesController {
  constructor(private promoCodesService: PromoCodesService) {}

  @Post("create")
  @ApiOperation({ summary: "Create new promo code" })
  @ApiResponse({
    status: 201,
    description: "Promo code created successfully",
    type: PromoCodeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Promo code with code already exists",
    schema: {
      example: {
        statusCode: 400,
        status: false,
        message: "Promo code with this code already exists",
        heading: "Error",
        data: null,
      },
    },
  })
  @ApiBody({ type: CreatePromoCodeDto })
  async create(
    @Body(ValidationPipe) createPromoCodeDto: CreatePromoCodeDto
  ): Promise<PromoCodeResponseDto> {
    return await this.promoCodesService.create(createPromoCodeDto);
  }

  @Get("getAll")
  @ApiOperation({ summary: "Get all promo codes with pagination" })
  @ApiResponse({
    status: 200,
    description: "Promo codes retrieved successfully",
    type: PromoCodesListResponseDto,
  })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "search", required: false, type: String, example: "SAVE10" })
  async findAll(
    @Query() searchPaginationDto: SearchPaginationDto
  ): Promise<any> {
    const { search, ...paginationDto } = searchPaginationDto;
    return await this.promoCodesService.findAll(paginationDto, search);
  }

  @Get("getById/:id")
  @ApiOperation({ summary: "Get promo code by ID" })
  @ApiResponse({
    status: 200,
    description: "Promo code retrieved successfully",
    type: PromoCodeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Promo code not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Promo code not found",
        heading: "Error",
        data: null,
      },
    },
  })
  @ApiParam({ name: "id", description: "Promo code ID" })
  async findOne(
    @Param("id") id: string
  ): Promise<PromoCodeResponseDto> {
    return await this.promoCodesService.findOne(id);
  }

  @Put("update")
  @ApiOperation({ summary: "Update promo code" })
  @ApiResponse({
    status: 200,
    description: "Promo code updated successfully",
    type: PromoCodeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Promo code not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Promo code not found",
        heading: "Error",
        data: null,
      },
    },
  })
  @ApiBody({ type: UpdatePromoCodeDto })
  async update(
    @Body(ValidationPipe) updatePromoCodeDto: UpdatePromoCodeDto
  ): Promise<PromoCodeResponseDto> {
    const { id, ...updateData } = updatePromoCodeDto;
    return await this.promoCodesService.update(id, updateData);
  }

  @Delete("delete")
  @ApiOperation({ summary: "Delete promo code" })
  @ApiResponse({
    status: 200,
    description: "Promo code deleted successfully",
    schema: {
      example: {
        statusCode: 200,
        status: true,
        message: "Promo code deleted successfully",
        heading: "Promo Code",
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Promo code not found",
    schema: {
      example: {
        statusCode: 404,
        status: false,
        message: "Promo code not found",
        heading: "Error",
        data: null,
      },
    },
  })
  @ApiBody({ type: DeletePromoCodeDto })
  async remove(
    @Body(ValidationPipe) deletePromoCodeDto: DeletePromoCodeDto
  ): Promise<any> {
    return await this.promoCodesService.remove(deletePromoCodeDto);
  }
}
