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

  private readonly filesBackendBaseUrl =
    process.env.FILES_BACKEND_URL || "http://localhost:3003";

  private extractProductsFileNameFromUrl(url: string): string | null {
    try {
      const u = new URL(url);
      const prefix = "/public/products/";
      if (!u.pathname.startsWith(prefix)) {
        return null;
      }
      const fileName = u.pathname.slice(prefix.length);
      if (!fileName) {
        return null;
      }
      return fileName;
    } catch {
      return null;
    }
  }

  private async deleteProductImageFromFilesBackend(
    fileName: string,
    authorizationHeader?: string
  ): Promise<void> {
    const endpoint = `${this.filesBackendBaseUrl}/v1/products/image/${encodeURIComponent(
      fileName
    )}`;

    const fetchFn: any = (global as any).fetch;
    const AbortControllerCtor: any = (global as any).AbortController;

    if (!fetchFn) {
      return;
    }

    const headers: Record<string, string> = {};
    if (authorizationHeader) {
      headers["authorization"] = authorizationHeader;
    }

    const controller = AbortControllerCtor ? new AbortControllerCtor() : undefined;
    const timeoutMs = parseInt(process.env.FILES_BACKEND_TIMEOUT_MS || "15000", 10);
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), timeoutMs)
      : undefined;

    try {
      await fetchFn(endpoint, {
        method: "DELETE",
        headers,
        signal: controller?.signal,
      });
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  private async uploadProductImageToFilesBackend(
    productId: string,
    file: { buffer: Buffer; mimetype: string; originalname: string },
    authorizationHeader?: string
  ): Promise<string> {
    const endpoint = `${this.filesBackendBaseUrl}/v1/products/${productId}/image`;

    const fetchFn: any = (global as any).fetch;
    const FormDataCtor: any = (global as any).FormData;
    const BlobCtor: any = (global as any).Blob;
    const AbortControllerCtor: any = (global as any).AbortController;

    if (!fetchFn || !FormDataCtor || !BlobCtor) {
      throw new BadRequestException(
        "Files upload requires Node.js runtime with fetch/FormData/Blob support"
      );
    }

    const form = new FormDataCtor();
    const blob = new BlobCtor([file.buffer], { type: file.mimetype });
    form.append("file", blob, file.originalname);

    const headers: Record<string, string> = {};
    if (authorizationHeader) {
      headers["authorization"] = authorizationHeader;
    }

    const controller = AbortControllerCtor ? new AbortControllerCtor() : undefined;
    const timeoutMs = parseInt(process.env.FILES_BACKEND_TIMEOUT_MS || "15000", 10);
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), timeoutMs)
      : undefined;

    try {
      const res = await fetchFn(endpoint, {
        method: "POST",
        body: form,
        headers,
        signal: controller?.signal,
      });

      const text = await res.text();
      let json: any;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        json = {};
      }

      if (!res.ok) {
        throw new BadRequestException(
          json?.message || `Files backend upload failed (${res.status})`
        );
      }

      const url =
        json?.url ||
        json?.data?.url ||
        json?.data?.fileUrl ||
        json?.data?.file_url;

      if (!url || typeof url !== "string") {
        throw new BadRequestException(
          "Files backend did not return a valid image URL"
        );
      }

      return url;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

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
    createProductDto: CreateProductDto,
    file: { buffer: Buffer; mimetype: string; originalname: string },
    authorizationHeader?: string
  ): Promise<ApiResponse<Product>> {
    const {
      title,
      description,
      price,
      stock_quantity,
      category_id,
      brand_id,
      currency,
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
      sku,
    });

    const savedProduct = await this.productRepository.save(product);

    try {
      const productImgUrl = await this.uploadProductImageToFilesBackend(
        savedProduct.id,
        file,
        authorizationHeader
      );

      await this.productRepository.update(savedProduct.id, {
        product_img_url: productImgUrl,
      });
    } catch (error) {
      await this.productRepository.remove(savedProduct);
      throw error;
    }

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

  async update(
    updateProductDto: UpdateProductDto,
    file?: { buffer: Buffer; mimetype: string; originalname: string },
    authorizationHeader?: string
  ): Promise<ApiResponse<Product>> {
    const {
      id,
      title,
      description,
      price,
      stock_quantity,
      category_id,
      brand_id,
      currency,
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
    };

    if (file) {
      const previousUrl = (product as any).product_img_url as string | undefined;
      const previousFileName = previousUrl
        ? this.extractProductsFileNameFromUrl(previousUrl)
        : null;

      const productImgUrl = await this.uploadProductImageToFilesBackend(
        product.id,
        file,
        authorizationHeader
      );
      (updateData as any).product_img_url = productImgUrl;

      await this.productRepository.update(id, updateData);

      if (previousFileName) {
        try {
          await this.deleteProductImageFromFilesBackend(
            previousFileName,
            authorizationHeader
          );
        } catch {
          // Best-effort cleanup only
        }
      }

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

  async delete(
    deleteProductDto: DeleteProductDto,
    authorizationHeader?: string
  ): Promise<ApiResponse<null>> {
    const { id } = deleteProductDto;

    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const previousUrl = (product as any).product_img_url as string | undefined;
    const previousFileName = previousUrl
      ? this.extractProductsFileNameFromUrl(previousUrl)
      : null;

    await this.productRepository.remove(product);

    if (previousFileName) {
      try {
        await this.deleteProductImageFromFilesBackend(
          previousFileName,
          authorizationHeader
        );
      } catch {
        // Best-effort cleanup only
      }
    }

    return ResponseHelper.success(
      null,
      "Product deleted successfully",
      "Product",
      200
    );
  }
}
