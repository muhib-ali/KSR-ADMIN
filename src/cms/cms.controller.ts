import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from "@nestjs/swagger";
import { CmsService } from "./cms.service";
import { CreateCmsSectionDto } from "./dto/create-cms-section.dto";
import { UpdateCmsSectionDto } from "./dto/update-cms-section.dto";
import { CmsQueryDto } from "./dto/cms-query.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("CMS")
@Controller("cms")
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Post("create")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Create CMS section with subsections" })
  @ApiResponse({ status: 201, description: "Section created successfully" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(
    @Body() dto: CreateCmsSectionDto,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.cmsService.create(dto, req.user.id);
    return {
      success: true,
      message: "CMS section created successfully",
      data,
    };
  }

  @Get("getAll")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get all CMS sections (paginated)" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "sort_by", required: false })
  @ApiQuery({ name: "order", required: false })
  @ApiResponse({ status: 200, description: "Sections retrieved successfully" })
  async findAll(@Query() query: CmsQueryDto) {
    const { rows, total } = await this.cmsService.findAll(query);
    return {
      success: true,
      message: "CMS sections retrieved successfully",
      data: rows,
      pagination: {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        total,
        totalPages: Math.ceil(total / (query.limit ?? 10)),
      },
    };
  }

  @Get("getById/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get CMS section by ID with subsections" })
  @ApiParam({ name: "id", description: "Section UUID" })
  @ApiResponse({ status: 200, description: "Section retrieved successfully" })
  @ApiResponse({ status: 404, description: "Section not found" })
  async findOne(@Param("id") id: string) {
    const data = await this.cmsService.findOne(id);
    return {
      success: true,
      message: "CMS section retrieved successfully",
      data,
    };
  }

  @Put("update/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update CMS section and subsections" })
  @ApiParam({ name: "id", description: "Section UUID" })
  @ApiResponse({ status: 200, description: "Section updated successfully" })
  @ApiResponse({ status: 404, description: "Section not found" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateCmsSectionDto,
    @Request() req: { user: { id: string }; headers?: { authorization?: string } },
  ) {
    const auth = req.headers?.authorization;
    const data = await this.cmsService.update(id, dto, req.user.id, auth);
    return {
      success: true,
      message: "CMS section updated successfully",
      data,
    };
  }

  @Delete("delete/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Delete CMS section and all subsections" })
  @ApiParam({ name: "id", description: "Section UUID" })
  @ApiResponse({ status: 204, description: "Section deleted" })
  @ApiResponse({ status: 404, description: "Section not found" })
  async remove(
    @Param("id") id: string,
    @Request() req: { headers?: { authorization?: string } },
  ) {
    const auth = req.headers?.authorization;
    await this.cmsService.remove(id, auth);
  }

  @Get("home-sections")
  @ApiOperation({
    summary: "Get all home CMS sections (public, for customer frontend)",
  })
  @ApiResponse({ status: 200, description: "Sections for home page" })
  async getHomeSections() {
    const data = await this.cmsService.getHomeSections();
    return {
      success: true,
      message: "Home sections retrieved successfully",
      data,
    };
  }
}
