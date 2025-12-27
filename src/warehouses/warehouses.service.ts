import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Warehouse } from "../entities/warehouse.entity";
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto";
import { DeleteWarehouseDto } from "./dto/delete-warehouse.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { ResponseHelper } from "../common/helpers/response.helper";
import {
  ApiResponse,
  PaginatedApiResponse,
} from "../common/interfaces/api-response.interface";

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>
  ) {}

  async create(
    createWarehouseDto: CreateWarehouseDto
  ): Promise<ApiResponse<Warehouse>> {
    const { name, code, address, is_active = true } = createWarehouseDto;

    const existingWarehouse = await this.warehouseRepository.findOne({
      where: { code },
    });

    if (existingWarehouse) {
      throw new BadRequestException("Warehouse with this code already exists");
    }

    const warehouse = this.warehouseRepository.create({
      name,
      code,
      address,
      is_active,
    });

    const savedWarehouse = await this.warehouseRepository.save(warehouse);

    return ResponseHelper.success(
      savedWarehouse,
      "Warehouse created successfully",
      "Warehouse",
      201
    );
  }

  async update(updateWarehouseDto: UpdateWarehouseDto): Promise<ApiResponse<Warehouse>> {
    const { id, name, code, address, is_active } = updateWarehouseDto;

    const warehouse = await this.warehouseRepository.findOne({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException("Warehouse not found");
    }

    const existingWarehouse = await this.warehouseRepository.findOne({
      where: { code },
    });

    if (existingWarehouse && existingWarehouse.id !== id) {
      throw new BadRequestException("Warehouse with this code already exists");
    }

    const updateData: Partial<Omit<UpdateWarehouseDto, "id">> = {
      name,
      code,
      address,
      is_active,
    };

    await this.warehouseRepository.update(id, updateData);

    const updatedWarehouse = await this.warehouseRepository.findOne({
      where: { id },
    });

    return ResponseHelper.success(
      updatedWarehouse!,
      "Warehouse updated successfully",
      "Warehouse",
      200
    );
  }

  async getById(id: string): Promise<ApiResponse<Warehouse>> {
    const warehouse = await this.warehouseRepository.findOne({ where: { id } });

    if (!warehouse) {
      throw new NotFoundException("Warehouse not found");
    }

    return ResponseHelper.success(
      warehouse,
      "Warehouse retrieved successfully",
      "Warehouse",
      200
    );
  }

  async getAll(
    paginationDto: PaginationDto,
    search?: string
  ): Promise<PaginatedApiResponse<Warehouse>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const qb = this.warehouseRepository
      .createQueryBuilder("warehouse")
      .orderBy("warehouse.created_at", "DESC")
      .skip(skip)
      .take(limit);

    const trimmedSearch = search?.trim();

    if (trimmedSearch) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where("warehouse.name ILIKE :search", {
              search: `%${trimmedSearch}%`,
            })
            .orWhere("warehouse.code ILIKE :search", {
              search: `%${trimmedSearch}%`,
            });
        })
      );
    }

    const [warehouses, total] = await qb.getManyAndCount();

    return ResponseHelper.paginated(
      warehouses,
      page,
      limit,
      total,
      "warehouses",
      "Warehouses retrieved successfully",
      "Warehouse"
    );
  }

  async delete(deleteWarehouseDto: DeleteWarehouseDto): Promise<ApiResponse<null>> {
    const { id } = deleteWarehouseDto;

    const warehouse = await this.warehouseRepository.findOne({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException("Warehouse not found");
    }

    await this.warehouseRepository.remove(warehouse);

    return ResponseHelper.success(
      null,
      "Warehouse deleted successfully",
      "Warehouse",
      200
    );
  }
}
