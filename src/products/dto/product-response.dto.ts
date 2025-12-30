import { ApiProperty } from "@nestjs/swagger";

export class CategoryDto {
  @ApiProperty({
    description: "Category ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Category name",
    example: "Shoes",
  })
  name: string;
}

export class BrandDto {
  @ApiProperty({
    description: "Brand ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Brand name",
    example: "Nike",
  })
  name: string;
}

export class ProductImageDto {
  @ApiProperty({
    description: "Product image ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Public image URL",
    example: "http://localhost:3003/public/products/uuid-1700000000-abcd1234.webp",
  })
  url: string;

  @ApiProperty({
    description: "Stored file name",
    example: "uuid-1700000000-abcd1234.webp",
  })
  file_name: string;

  @ApiProperty({
    description: "Sort order (1..5)",
    example: 1,
  })
  sort_order: number;
}

export class TaxDto {
  @ApiProperty({
    description: "Tax ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Tax title",
    example: "VAT",
  })
  title: string;

  @ApiProperty({
    description: "Tax rate",
    example: 15.5,
  })
  rate: number;
}

export class SupplierDto {
  @ApiProperty({
    description: "Supplier ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Supplier name",
    example: "ABC Suppliers",
  })
  supplier_name: string;

  @ApiProperty({
    description: "Supplier email",
    example: "contact@abc.com",
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    description: "Supplier phone",
    example: "+1234567890",
    nullable: true,
  })
  phone: string | null;
}

export class WarehouseDto {
  @ApiProperty({
    description: "Warehouse ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Warehouse name",
    example: "Main Warehouse",
  })
  name: string;

  @ApiProperty({
    description: "Warehouse code",
    example: "WH001",
  })
  code: string;
}

export class BulkPriceDto {
  @ApiProperty({
    description: "Bulk price ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Minimum quantity for bulk pricing",
    example: 10,
  })
  quantity: number;

  @ApiProperty({
    description: "Price per product for this quantity",
    example: 15.99,
  })
  price_per_product: number;

  @ApiProperty({
    description: "Product ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  product_id: string;
}

export class ProductDto {
  @ApiProperty({
    description: "Product ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Product title",
    example: "Nike Air Max",
  })
  title: string;

  @ApiProperty({
    description: "Product description",
    example: "Comfortable running shoes",
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: "Product price",
    example: 199.99,
  })
  price: number;

  @ApiProperty({
    description: "Stock quantity",
    example: 50,
  })
  stock_quantity: number;

  @ApiProperty({
    description: "Category ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  category_id: string;

  @ApiProperty({
    description: "Brand ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  brand_id: string;

  @ApiProperty({
    description: "Currency code",
    example: "USD",
  })
  currency: string;

  @ApiProperty({
    description: "Product image URL",
    example: "https://example.com/images/product.png",
    nullable: true,
  })
  product_img_url: string | null;

  @ApiProperty({
    description: "Product SKU",
    example: "NIKE-SHOE-0001",
  })
  sku: string;

  @ApiProperty({
    description: "Is product active",
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: "Created by user ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    nullable: true,
  })
  created_by: string | null;

  @ApiProperty({
    description: "Updated by user ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    nullable: true,
  })
  updated_by: string | null;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  })
  created_at: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2024-01-01T00:00:00.000Z",
  })
  updated_at: Date;

  @ApiProperty({
    description: "Product category",
    type: CategoryDto,
  })
  category: CategoryDto;

  @ApiProperty({
    description: "Product brand",
    type: BrandDto,
  })
  brand: BrandDto;

  @ApiProperty({
    description: "Product images",
    type: [ProductImageDto],
    required: false,
  })
  images?: ProductImageDto[];

  @ApiProperty({
    description: "Product video URL",
    example: "https://example.com/videos/product.mp4",
    nullable: true,
  })
  product_video_url: string | null;

  @ApiProperty({
    description: "Discount percentage",
    example: 10.50,
  })
  discount: number;

  @ApiProperty({
    description: "Discount start date",
    example: "2024-01-01T00:00:00Z",
    nullable: true,
  })
  start_discount_date: Date | null;

  @ApiProperty({
    description: "Discount end date",
    example: "2024-12-31T23:59:59Z",
    nullable: true,
  })
  end_discount_date: Date | null;

  @ApiProperty({
    description: "Product length",
    example: 25.50,
    nullable: true,
  })
  length: number | null;

  @ApiProperty({
    description: "Product width",
    example: 15.75,
    nullable: true,
  })
  width: number | null;

  @ApiProperty({
    description: "Product height",
    example: 8.25,
    nullable: true,
  })
  height: number | null;

  @ApiProperty({
    description: "Product weight",
    example: 2.5,
    nullable: true,
  })
  weight: number | null;

  @ApiProperty({
    description: "Total price after tax",
    example: 219.99,
  })
  total_price: number;

  @ApiProperty({
    description: "Product tax",
    type: TaxDto,
    nullable: true,
  })
  tax?: TaxDto;

  @ApiProperty({
    description: "Product supplier",
    type: SupplierDto,
    nullable: true,
  })
  supplier?: SupplierDto;

  @ApiProperty({
    description: "Product warehouse",
    type: WarehouseDto,
    nullable: true,
  })
  warehouse?: WarehouseDto;

  @ApiProperty({
    description: "Product bulk prices",
    type: [BulkPriceDto],
    required: false,
  })
  bulkPrices?: BulkPriceDto[];
}

export class ProductResponseDto {
  @ApiProperty({
    description: "Status code",
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: "Operation status",
    example: true,
  })
  status: boolean;

  @ApiProperty({
    description: "Response message",
    example: "Product retrieved successfully",
  })
  message: string;

  @ApiProperty({
    description: "Product heading",
    example: "Product",
  })
  heading: string;

  @ApiProperty({
    description: "Product data",
    type: ProductDto,
  })
  data: ProductDto;
}

export class PaginationDto {
  @ApiProperty({
    description: "Current page number",
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: "Items per page",
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: "Total number of items",
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: "Total number of pages",
    example: 3,
  })
  totalPages: number;

  @ApiProperty({
    description: "Has next page",
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: "Has previous page",
    example: false,
  })
  hasPrev: boolean;

  @ApiProperty({
    description: "Next page number",
    example: 2,
    nullable: true,
  })
  nextPage: number | null;

  @ApiProperty({
    description: "Previous page number",
    example: null,
    nullable: true,
  })
  prevPage: number | null;
}

export class ProductsListDataDto {
  @ApiProperty({
    type: [ProductDto],
    description: "Array of products",
  })
  products: ProductDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class ProductsListResponseDto {
  @ApiProperty({
    description: "HTTP status code",
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: "Success status",
    example: true,
  })
  status: boolean;

  @ApiProperty({
    description: "Response message",
    example: "Products retrieved successfully",
  })
  message: string;

  @ApiProperty({
    description: "Module heading",
    example: "Product",
  })
  heading: string;

  @ApiProperty({ type: ProductsListDataDto })
  data: ProductsListDataDto;
}
