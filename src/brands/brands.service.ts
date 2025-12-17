import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Brand } from "../entities/brand.entity";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { DeleteBrandDto } from "./dto/delete-brand.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { ResponseHelper } from "../common/helpers/response.helper";
import {
  ApiResponse,
  PaginatedApiResponse,
} from "../common/interfaces/api-response.interface";

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<ApiResponse<Brand>> {
    const { name, description } = createBrandDto;

    const existingBrand = await this.brandRepository.findOne({
      where: { name },
    });

    if (existingBrand) {
      throw new BadRequestException("Brand with this name already exists");
    }

    const brand = this.brandRepository.create({
      name,
      description,
    });

    const savedBrand = await this.brandRepository.save(brand);

    return ResponseHelper.success(
      savedBrand,
      "Brand created successfully",
      "Brand",
      201
    );
  }

  async update(updateBrandDto: UpdateBrandDto): Promise<ApiResponse<Brand>> {
    const { id, name, description } = updateBrandDto;

    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    const existingBrand = await this.brandRepository.findOne({
      where: { name },
    });

    if (existingBrand && existingBrand.id !== id) {
      throw new BadRequestException("Brand with this name already exists");
    }

    const updateData: Partial<Omit<UpdateBrandDto, "id">> = {
      name,
      description,
    };

    await this.brandRepository.update(id, updateData);

    const updatedBrand = await this.brandRepository.findOne({
      where: { id },
    });

    return ResponseHelper.success(
      updatedBrand!,
      "Brand updated successfully",
      "Brand",
      200
    );
  }

  async getById(id: string): Promise<ApiResponse<Brand>> {
    const brand = await this.brandRepository.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    return ResponseHelper.success(
      brand,
      "Brand retrieved successfully",
      "Brand",
      200
    );
  }

  async getAll(
    paginationDto: PaginationDto,
    search?: string
  ): Promise<PaginatedApiResponse<Brand>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const qb = this.brandRepository
      .createQueryBuilder("brand")
      .orderBy("brand.created_at", "DESC")
      .skip(skip)
      .take(limit);

    const trimmedSearch = search?.trim();

    if (trimmedSearch) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where("brand.name ILIKE :search", {
              search: `%${trimmedSearch}%`,
            })
            .orWhere("brand.description ILIKE :search", {
              search: `%${trimmedSearch}%`,
            });
        })
      );
    }

    const [brands, total] = await qb.getManyAndCount();

    return ResponseHelper.paginated(
      brands,
      page,
      limit,
      total,
      "brands",
      "Brands retrieved successfully",
      "Brand"
    );
  }

  async delete(deleteBrandDto: DeleteBrandDto): Promise<ApiResponse<null>> {
    const { id } = deleteBrandDto;

    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    await this.brandRepository.remove(brand);

    return ResponseHelper.success(null, "Brand deleted successfully", "Brand", 200);
  }
}
