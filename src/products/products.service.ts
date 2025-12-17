import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Product } from "../entities/product.entity";
import { Category } from "../entities/category.entity";
import { Brand } from "../entities/brand.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { DeleteProductDto } from "./dto/delete-product.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { ResponseHelper } from "../common/helpers/response.helper";
import {
  ApiResponse,
  PaginatedApiResponse,
} from "../common/interfaces/api-response.interface";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>
  ) {}

  private sanitizeSkuSegment(value: string): string {
    return (value || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  private async generateSku(brandName: string, categoryName: string) {
    const brandSegment = this.sanitizeSkuSegment(brandName);
    const categorySegment = this.sanitizeSkuSegment(categoryName);

    if (!brandSegment || !categorySegment) {
      throw new BadRequestException("Invalid brand/category for SKU generation");
    }

    const prefix = `${brandSegment}-${categorySegment}`;

    const lastProduct = await this.productRepository
      .createQueryBuilder("p")
      .select(["p.sku"])
      .where("p.sku LIKE :pattern", { pattern: `${prefix}-%` })
      .orderBy("p.sku", "DESC")
      .limit(1)
      .getOne();

    let nextSeq = 1;

    if (lastProduct?.sku) {
      const match = lastProduct.sku.match(/-(\d{4})$/);
      if (match?.[1]) {
        nextSeq = parseInt(match[1], 10) + 1;
      }
    }

    const seqSegment = String(nextSeq).padStart(4, "0");
    return `${prefix}-${seqSegment}`;
  }

  async create(
    createProductDto: CreateProductDto
  ): Promise<ApiResponse<Product>> {
    const {
      title,
      description,
      price,
      stock_quantity,
      category_id,
      brand_id,
      currency,
      product_img_url,
    } = createProductDto;

    const category = await this.categoryRepository.findOne({
      where: { id: category_id },
    });

    if (!category) {
      throw new BadRequestException("Category not found");
    }

    const brand = await this.brandRepository.findOne({ where: { id: brand_id } });

    if (!brand) {
      throw new BadRequestException("Brand not found");
    }

    const sku = await this.generateSku(brand.name, category.name);

    const product = this.productRepository.create({
      title,
      description,
      price,
      stock_quantity,
      category_id,
      brand_id,
      currency,
      product_img_url,
      sku,
    });

    const savedProduct = await this.productRepository.save(product);

    const productWithRelations = await this.productRepository.findOne({
      where: { id: savedProduct.id },
      relations: ["category", "brand"],
    });

    return ResponseHelper.success(
      productWithRelations!,
      "Product created successfully",
      "Product",
      201
    );
  }

  async update(updateProductDto: UpdateProductDto): Promise<ApiResponse<Product>> {
    const {
      id,
      title,
      description,
      price,
      stock_quantity,
      category_id,
      brand_id,
      currency,
      product_img_url,
    } = updateProductDto;

    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const category = await this.categoryRepository.findOne({
      where: { id: category_id },
    });

    if (!category) {
      throw new BadRequestException("Category not found");
    }

    const brand = await this.brandRepository.findOne({ where: { id: brand_id } });

    if (!brand) {
      throw new BadRequestException("Brand not found");
    }

    const updateData: Partial<Omit<UpdateProductDto, "id">> = {
      title,
      description,
      price,
      stock_quantity,
      category_id,
      brand_id,
      currency,
      product_img_url,
    };

    await this.productRepository.update(id, updateData);

    const updatedProduct = await this.productRepository.findOne({
      where: { id },
      relations: ["category", "brand"],
    });

    return ResponseHelper.success(
      updatedProduct!,
      "Product updated successfully",
      "Product",
      200
    );
  }

  async getById(id: string): Promise<ApiResponse<Product>> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["category", "brand"],
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return ResponseHelper.success(product, "Product found", "Product", 200);
  }

  async getAll(
    paginationDto: PaginationDto,
    search?: string
  ): Promise<PaginatedApiResponse<Product>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const qb = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.brand", "brand")
      .orderBy("product.created_at", "DESC")
      .skip(skip)
      .take(limit);

    const trimmedSearch = search?.trim();

    if (trimmedSearch) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where("product.title ILIKE :search", {
              search: `%${trimmedSearch}%`,
            })
            .orWhere("product.sku ILIKE :search", {
              search: `%${trimmedSearch}%`,
            })
            .orWhere("product.currency ILIKE :search", {
              search: `%${trimmedSearch}%`,
            })
            .orWhere("category.name ILIKE :search", {
              search: `%${trimmedSearch}%`,
            })
            .orWhere("brand.name ILIKE :search", {
              search: `%${trimmedSearch}%`,
            });
        })
      );
    }

    const [products, total] = await qb.getManyAndCount();

    return ResponseHelper.paginated(
      products,
      page,
      limit,
      total,
      "products",
      "Products retrieved successfully",
      "Product"
    );
  }

  async delete(deleteProductDto: DeleteProductDto): Promise<ApiResponse<null>> {
    const { id } = deleteProductDto;

    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    await this.productRepository.remove(product);

    return ResponseHelper.success(
      null,
      "Product deleted successfully",
      "Product",
      200
    );
  }
}
