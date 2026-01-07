import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { PromoCode } from "../entities/promo-code.entity";
import { CreatePromoCodeDto } from "./dto/create-promo-code.dto";
import { UpdatePromoCodeDto } from "./dto/update-promo-code.dto";
import { DeletePromoCodeDto } from "./dto/delete-promo-code.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { ResponseHelper } from "../common/helpers/response.helper";
import {
  ApiResponse,
  PaginatedApiResponse,
} from "../common/interfaces/api-response.interface";

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectRepository(PromoCode)
    private promoCodeRepository: Repository<PromoCode>
  ) {}

  async create(createPromoCodeDto: CreatePromoCodeDto): Promise<ApiResponse<PromoCode>> {
    const { code, value, usageLimit, expiresAt, isActive } = createPromoCodeDto;

    const existingPromoCode = await this.promoCodeRepository.findOne({
      where: { code },
    });

    if (existingPromoCode) {
      throw new BadRequestException("Promo code with this code already exists");
    }

    const promoCode = this.promoCodeRepository.create({
      code: code.toUpperCase(),
      value,
      usage_limit: usageLimit,
      expires_at: expiresAt,
      is_active: isActive !== undefined ? isActive : true,
      usage_count: 0,
    });

    const savedPromoCode = await this.promoCodeRepository.save(promoCode);

    return ResponseHelper.success(
      savedPromoCode,
      "Promo code created successfully",
      "Promo Code",
      201
    );
  }

  async findAll(
    paginationDto: PaginationDto,
    search?: string
  ): Promise<PaginatedApiResponse<PromoCode>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.promoCodeRepository
      .createQueryBuilder("promocode")
      .orderBy("promocode.created_at", "DESC");

    if (search) {
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where("promocode.code ILIKE :search", { search: `%${search}%` })
            .orWhere("promocode.value::text ILIKE :search", { search: `%${search}%` });
        })
      );
    }

    const [promoCodes, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return ResponseHelper.paginated(
      promoCodes,
      page,
      limit,
      total,
      "promoCodes",
      "Promo codes retrieved successfully",
      "Promo Code"
    );
  }

  async findOne(id: string): Promise<ApiResponse<PromoCode>> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { id },
    });

    if (!promoCode) {
      throw new NotFoundException("Promo code not found");
    }

    return ResponseHelper.success(
      promoCode,
      "Promo code retrieved successfully",
      "Promo Code"
    );
  }

  async update(
    id: string,
    updatePromoCodeDto: Partial<UpdatePromoCodeDto>
  ): Promise<ApiResponse<PromoCode>> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { id },
    });

    if (!promoCode) {
      throw new NotFoundException("Promo code not found");
    }

    if (updatePromoCodeDto.code && updatePromoCodeDto.code !== promoCode.code) {
      const existingPromoCode = await this.promoCodeRepository.findOne({
        where: { code: updatePromoCodeDto.code.toUpperCase() },
      });

      if (existingPromoCode) {
        throw new BadRequestException("Promo code with this code already exists");
      }
    }

    const updateData: any = { ...updatePromoCodeDto };
    
    // Map camelCase DTO fields to snake_case entity fields
    if (updateData.usageLimit !== undefined) {
      updateData.usage_limit = updateData.usageLimit;
      delete updateData.usageLimit;
    }
    
    if (updateData.expiresAt !== undefined) {
      updateData.expires_at = updateData.expiresAt;
      delete updateData.expiresAt;
    }
    
    if (updateData.isActive !== undefined) {
      updateData.is_active = updateData.isActive;
      delete updateData.isActive;
    }
    
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    // Remove undefined values to prevent empty criteria error
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Only update if there's actual data to update
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException("No data provided for update");
    }

    await this.promoCodeRepository.update(id, updateData);

    const updatedPromoCode = await this.promoCodeRepository.findOne({
      where: { id },
    });

    return ResponseHelper.success(
      updatedPromoCode,
      "Promo code updated successfully",
      "Promo Code"
    );
  }

  async remove(deletePromoCodeDto: DeletePromoCodeDto): Promise<ApiResponse<null>> {
    const { id } = deletePromoCodeDto;

    const promoCode = await this.promoCodeRepository.findOne({
      where: { id },
    });

    if (!promoCode) {
      throw new NotFoundException("Promo code not found");
    }

    await this.promoCodeRepository.remove(promoCode);

    return ResponseHelper.success(
      null,
      "Promo code deleted successfully",
      "Promo Code"
    );
  }

  async validatePromoCode(code: string): Promise<ApiResponse<PromoCode>> {
    const promoCode = await this.promoCodeRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      throw new BadRequestException("Invalid promo code");
    }

    if (!promoCode.is_active) {
      throw new BadRequestException("Promo code is inactive");
    }

    if (promoCode.expires_at && new Date() > promoCode.expires_at) {
      throw new BadRequestException("Promo code has expired");
    }

    if (promoCode.usage_limit && promoCode.usage_count >= promoCode.usage_limit) {
      throw new BadRequestException("Promo code usage limit reached");
    }

    return ResponseHelper.success(
      promoCode,
      "Promo code is valid",
      "Promo Code"
    );
  }

  async incrementUsage(id: string): Promise<void> {
    await this.promoCodeRepository.increment({ id }, "usage_count", 1);
  }
}
