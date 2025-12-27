import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Supplier } from "../entities/supplier.entity";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { DeleteSupplierDto } from "./dto/delete-supplier.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { ResponseHelper } from "../common/helpers/response.helper";
import {
  ApiResponse,
  PaginatedApiResponse,
} from "../common/interfaces/api-response.interface";

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>
  ) {}

  async create(
    createSupplierDto: CreateSupplierDto
  ): Promise<ApiResponse<Supplier>> {
    const { supplier_name, email, phone, address, is_active } = createSupplierDto;

    const existingSupplier = await this.supplierRepository.findOne({
      where: { supplier_name },
    });

    if (existingSupplier) {
      throw new BadRequestException("Supplier with this name already exists");
    }

    const supplier = this.supplierRepository.create({
      supplier_name,
      email,
      phone,
      address,
      is_active,
    });

    const savedSupplier = await this.supplierRepository.save(supplier);

    return ResponseHelper.success(
      savedSupplier,
      "Supplier created successfully",
      "Supplier",
      201
    );
  }

  async update(updateSupplierDto: UpdateSupplierDto): Promise<ApiResponse<Supplier>> {
    const { id, supplier_name, email, phone, address, is_active } = updateSupplierDto;

    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException("Supplier not found");
    }

    const existingSupplier = await this.supplierRepository.findOne({
      where: { supplier_name },
    });

    if (existingSupplier && existingSupplier.id !== id) {
      throw new BadRequestException("Supplier with this name already exists");
    }

    const updateData: Partial<Omit<UpdateSupplierDto, "id">> = {
      supplier_name,
      email,
      phone,
      address,
      is_active,
    };

    await this.supplierRepository.update(id, updateData);

    const updatedSupplier = await this.supplierRepository.findOne({
      where: { id },
    });

    return ResponseHelper.success(
      updatedSupplier!,
      "Supplier updated successfully",
      "Supplier",
      200
    );
  }

  async getById(id: string): Promise<ApiResponse<Supplier>> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });

    if (!supplier) {
      throw new NotFoundException("Supplier not found");
    }

    return ResponseHelper.success(
      supplier,
      "Supplier retrieved successfully",
      "Supplier",
      200
    );
  }

  async getAll(
    paginationDto: PaginationDto,
    search?: string
  ): Promise<PaginatedApiResponse<Supplier>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const qb = this.supplierRepository
      .createQueryBuilder("supplier")
      .orderBy("supplier.created_at", "DESC")
      .skip(skip)
      .take(limit);

    const trimmedSearch = search?.trim();

    if (trimmedSearch) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where("supplier.supplier_name ILIKE :search", {
              search: `%${trimmedSearch}%`,
            })
            .orWhere("supplier.email ILIKE :search", {
              search: `%${trimmedSearch}%`,
            });
        })
      );
    }

    const [suppliers, total] = await qb.getManyAndCount();

    return ResponseHelper.paginated(
      suppliers,
      page,
      limit,
      total,
      "suppliers",
      "Suppliers retrieved successfully",
      "Supplier"
    );
  }

  async delete(deleteSupplierDto: DeleteSupplierDto): Promise<ApiResponse<null>> {
    const { id } = deleteSupplierDto;

    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException("Supplier not found");
    }

    await this.supplierRepository.remove(supplier);

    return ResponseHelper.success(
      null,
      "Supplier deleted successfully",
      "Supplier",
      200
    );
  }
}
