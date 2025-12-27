import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Tax } from "../entities/tax.entity";
import { CreateTaxDto } from "./dto/create-tax.dto";
import { UpdateTaxDto } from "./dto/update-tax.dto";
import { DeleteTaxDto } from "./dto/delete-tax.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { ResponseHelper } from "../common/helpers/response.helper";
import {
  ApiResponse,
  PaginatedApiResponse,
} from "../common/interfaces/api-response.interface";

@Injectable()
export class TaxesService {
  constructor(
    @InjectRepository(Tax)
    private taxRepository: Repository<Tax>
  ) {}

  async create(createTaxDto: CreateTaxDto): Promise<ApiResponse<Tax>> {
    const { title, rate, is_active } = createTaxDto;

    const existingTax = await this.taxRepository.findOne({
      where: { title },
    });

    if (existingTax) {
      throw new BadRequestException("Tax with this title already exists");
    }

    const tax = this.taxRepository.create({
      title,
      rate,
      is_active,
    });

    const savedTax = await this.taxRepository.save(tax);

    return ResponseHelper.success(
      savedTax,
      "Tax created successfully",
      "Tax",
      201
    );
  }

  async update(updateTaxDto: UpdateTaxDto): Promise<ApiResponse<Tax>> {
    const { id, title, rate, is_active } = updateTaxDto;

    const tax = await this.taxRepository.findOne({ where: { id } });
    if (!tax) {
      throw new NotFoundException("Tax not found");
    }

    const existingTax = await this.taxRepository.findOne({
      where: { title },
    });

    if (existingTax && existingTax.id !== id) {
      throw new BadRequestException("Tax with this title already exists");
    }

    const updateData: Partial<Omit<UpdateTaxDto, "id">> = {
      title,
      rate,
      is_active,
    };

    await this.taxRepository.update(id, updateData);

    const updatedTax = await this.taxRepository.findOne({
      where: { id },
    });

    return ResponseHelper.success(
      updatedTax!,
      "Tax updated successfully",
      "Tax",
      200
    );
  }

  async getById(id: string): Promise<ApiResponse<Tax>> {
    const tax = await this.taxRepository.findOne({ where: { id } });

    if (!tax) {
      throw new NotFoundException("Tax not found");
    }

    return ResponseHelper.success(
      tax,
      "Tax retrieved successfully",
      "Tax",
      200
    );
  }

  async getAll(
    paginationDto: PaginationDto,
    search?: string
  ): Promise<PaginatedApiResponse<Tax>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const qb = this.taxRepository
      .createQueryBuilder("tax")
      .orderBy("tax.created_at", "DESC")
      .skip(skip)
      .take(limit);

    const trimmedSearch = search?.trim();

    if (trimmedSearch) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where("tax.title ILIKE :search", {
              search: `%${trimmedSearch}%`,
            });
        })
      );
    }

    const [taxes, total] = await qb.getManyAndCount();

    return ResponseHelper.paginated(
      taxes,
      page,
      limit,
      total,
      "taxes",
      "Taxes retrieved successfully",
      "Tax"
    );
  }

  async delete(deleteTaxDto: DeleteTaxDto): Promise<ApiResponse<null>> {
    const { id } = deleteTaxDto;

    const tax = await this.taxRepository.findOne({ where: { id } });
    if (!tax) {
      throw new NotFoundException("Tax not found");
    }

    await this.taxRepository.remove(tax);

    return ResponseHelper.success(
      null,
      "Tax deleted successfully",
      "Tax",
      200
    );
  }
}
