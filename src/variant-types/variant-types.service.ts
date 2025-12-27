import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VariantType } from "../entities/variant-type.entity";
import { Variant } from "../entities/variant.entity";
import { CreateVariantTypeDto } from "./dto/create-variant-type.dto";
import { UpdateVariantTypeDto } from "./dto/update-variant-type.dto";
import { DeleteVariantTypeDto } from "./dto/delete-variant-type.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { SearchPaginationDto } from "../common/dto/search-pagination.dto";
import { ResponseHelper } from "../common/helpers/response.helper";
import {
  ApiResponse,
  PaginatedApiResponse,
} from "../common/interfaces/api-response.interface";

@Injectable()
export class VariantTypesService {
  constructor(
    @InjectRepository(VariantType)
    private variantTypeRepository: Repository<VariantType>,
    @InjectRepository(Variant)
    private variantRepository: Repository<Variant>
  ) {}

  async create(createVariantTypeDto: CreateVariantTypeDto): Promise<ApiResponse<VariantType>> {
    const { name, is_active } = createVariantTypeDto;

    // Check if variant type name already exists
    const existingVariantType = await this.variantTypeRepository.findOne({
      where: { name: name.trim() },
    });

    if (existingVariantType) {
      throw new BadRequestException("Variant type name already exists");
    }

    const variantType = this.variantTypeRepository.create({
      name: name.trim(),
      ...(typeof is_active === "boolean" ? { is_active } : {}),
    });

    const savedVariantType = await this.variantTypeRepository.save(variantType);

    return ResponseHelper.success(
      savedVariantType,
      "Variant type created successfully",
      "VariantType",
      201
    );
  }

  async update(updateVariantTypeDto: UpdateVariantTypeDto): Promise<ApiResponse<VariantType>> {
    const { id, name, is_active } = updateVariantTypeDto;

    const variantType = await this.variantTypeRepository.findOne({ where: { id } });
    if (!variantType) {
      throw new NotFoundException("Variant type not found");
    }

    // Check if name is being updated and if it already exists
    if (name && name.trim() !== variantType.name) {
      const existingVariantType = await this.variantTypeRepository.findOne({
        where: { name: name.trim() },
      });

      if (existingVariantType) {
        throw new BadRequestException("Variant type name already exists");
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (typeof is_active === "boolean") updateData.is_active = is_active;

    await this.variantTypeRepository.update(id, updateData);

    const updatedVariantType = await this.variantTypeRepository.findOne({ where: { id } });

    return ResponseHelper.success(
      updatedVariantType!,
      "Variant type updated successfully",
      "VariantType",
      200
    );
  }

  async getById(id: string): Promise<ApiResponse<VariantType>> {
    const variantType = await this.variantTypeRepository.findOne({
      where: { id },
      relations: ["variants"],
    });

    if (!variantType) {
      throw new NotFoundException("Variant type not found");
    }

    return ResponseHelper.success(
      variantType,
      "Variant type retrieved successfully",
      "VariantType",
      200
    );
  }

  async getAll(queryDto: SearchPaginationDto): Promise<PaginatedApiResponse<VariantType>> {
    const { page, limit, search } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.variantTypeRepository
      .createQueryBuilder("variantType")
      .leftJoinAndSelect("variantType.variants", "variants");

    if (search) {
      queryBuilder.where("variantType.name ILIKE :search", { search: `%${search}%` });
    }

    const [variantTypes, total] = await queryBuilder
      .orderBy("variantType.created_at", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return ResponseHelper.paginated(
      variantTypes,
      page,
      limit,
      total,
      "items",
      "Variant types retrieved successfully",
      "VariantType"
    );
  }

  async delete(deleteVariantTypeDto: DeleteVariantTypeDto): Promise<ApiResponse<null>> {
    const { id } = deleteVariantTypeDto;

    const variantType = await this.variantTypeRepository.findOne({ where: { id } });
    if (!variantType) {
      throw new NotFoundException("Variant type not found");
    }

    // Check if there are any variants using this variant type
    const variantCount = await this.variantRepository.count({
      where: { vtype_id: parseInt(id) },
    });

    if (variantCount > 0) {
      throw new BadRequestException(
        "Cannot delete variant type. It is being used by variants. Please delete the variants first."
      );
    }

    await this.variantTypeRepository.remove(variantType);

    return ResponseHelper.success(
      null,
      "Variant type deleted successfully",
      "VariantType",
      200
    );
  }
}
