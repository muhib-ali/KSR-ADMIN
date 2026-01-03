
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Category } from "../entities/category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { DeleteCategoryDto } from "./dto/delete-category.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { ResponseHelper } from "../common/helpers/response.helper";
import {
  ApiResponse,
  PaginatedApiResponse,
} from "../common/interfaces/api-response.interface";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto
  ): Promise<ApiResponse<Category>> {
    const { name, description, isActive } = createCategoryDto;

    const existingCategory = await this.categoryRepository.findOne({
      where: { name },
    });

    if (existingCategory) {
      throw new BadRequestException("Category with this name already exists");
    }

    const category = this.categoryRepository.create({
      name,
      description,
      is_active: isActive !== undefined ? isActive : true, // Default to true if not provided
    });

    const savedCategory = await this.categoryRepository.save(category);

    return ResponseHelper.success(
      savedCategory,
      "Category created successfully",
      "Category",
      201
    );
  }

  async update(updateCategoryDto: UpdateCategoryDto): Promise<ApiResponse<Category>> {
    const { id, name, description, isActive } = updateCategoryDto;

    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException("Category not found");
    }

    const existingCategory = await this.categoryRepository.findOne({
      where: { name },
    });

    if (existingCategory && existingCategory.id !== id) {
      throw new BadRequestException("Category with this name already exists");
    }

    const updateData: any = {
      name,
      description,
    };

    // Only include isActive if it's provided
    if (isActive !== undefined) {
      updateData.is_active = isActive;
    }

    await this.categoryRepository.update(id, updateData);

    const updatedCategory = await this.categoryRepository.findOne({
      where: { id },
    });

    return ResponseHelper.success(
      updatedCategory,
      "Category updated successfully",
      "Category",
      200
    );
  }

  async getById(id: string): Promise<ApiResponse<Category>> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return ResponseHelper.success(
      category,
      "Category retrieved successfully",
      "Category",
      200
    );
  }

  async getAll(
    paginationDto: PaginationDto,
    search?: string
  ): Promise<PaginatedApiResponse<Category>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const qb = this.categoryRepository
      .createQueryBuilder("category")
      .orderBy("category.created_at", "DESC")
      .skip(skip)
      .take(limit);

    const trimmedSearch = search?.trim();

    if (trimmedSearch) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where("category.name ILIKE :search", {
              search: `%${trimmedSearch}%`,
            })
            .orWhere("category.description ILIKE :search", {
              search: `%${trimmedSearch}%`,
            });
        })
      );
    }

    const [categories, total] = await qb.getManyAndCount();

    return ResponseHelper.paginated(
      categories,
      page,
      limit,
      total,
      "categories",
      "Categories retrieved successfully",
      "Category"
    );
  }

  async delete(deleteCategoryDto: DeleteCategoryDto): Promise<ApiResponse<null>> {
    const { id } = deleteCategoryDto;

    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException("Category not found");
    }

    await this.categoryRepository.remove(category);

    return ResponseHelper.success(
      null,
      "Category deleted successfully",
      "Category",
      200
    );
  }
}
