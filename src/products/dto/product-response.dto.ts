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
