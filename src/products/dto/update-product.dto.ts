import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsInt,
  IsBoolean,
  Min,
  IsDate,
  IsArray,
  ValidateNested,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { CreateVariantDto } from "./create-variant.dto";
import { CreateBulkPriceDto } from "./create-bulk-price.dto";
import { CreateCvgProductDto } from "./create-cvg-product.dto";

export class UpdateProductDto {
  @ApiProperty({
    description: "Product ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: "Product title",
    example: "Nike Air Max",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: "Product description",
    example: "Comfortable running shoes",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "Product price",
    example: 199.99,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiProperty({
    description: "Product cost price",
    example: 150.00,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  cost?: number;

  @ApiProperty({
    description: "Product freight/shipping cost",
    example: 25.00,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  freight?: number;

  @ApiProperty({
    description: "Available stock quantity",
    example: 50,
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  stock_quantity: number;

  @ApiProperty({
    description: "Category ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  category_id: string;

  @ApiProperty({
    description: "Brand ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  brand_id: string;

  @ApiProperty({
    description: "Currency code",
    example: "USD",
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: "Product image URL",
    example: "http://localhost:3003/public/products/your-file.webp",
    required: false,
  })
  @IsString()
  @IsOptional()
  product_img_url?: string;

  @ApiProperty({
    description: "Product video URL",
    example: "http://localhost:3003/public/products/your-video.mp4",
    required: false,
  })
  @IsString()
  @IsOptional()
  product_video_url?: string;

  @ApiProperty({
    description: "Product active status",
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({
    description: "Discount percentage",
    example: 10.50,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number;

  @ApiProperty({
    description: "Discount start date",
    example: "2024-01-01T00:00:00Z",
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  start_discount_date?: Date;

  @ApiProperty({
    description: "Discount end date",
    example: "2024-12-31T23:59:59Z",
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  end_discount_date?: Date;

  @ApiProperty({
    description: "Product length",
    example: 25.50,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  length?: number;

  @ApiProperty({
    description: "Product width",
    example: 15.75,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  width?: number;

  @ApiProperty({
    description: "Product height",
    example: 8.25,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  height?: number;

  @ApiProperty({
    description: "Product weight",
    example: 2.5,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @ApiProperty({
    description: "Tax ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsUUID()
  @IsOptional()
  tax_id?: string;

  @ApiProperty({
    description: "Supplier ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsUUID()
  @IsOptional()
  supplier_id?: string;

  @ApiProperty({
    description: "Warehouse ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsUUID()
  @IsOptional()
  warehouse_id?: string;

  @ApiProperty({
    description: "Total price after tax (calculated by frontend)",
    example: 219.99,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  total_price: number;

  @ApiProperty({
    description: "Product variants",
    type: [CreateVariantDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  @IsOptional()
  variants?: CreateVariantDto[];

  @ApiProperty({
    description: "Customer visibility groups",
    type: CreateCvgProductDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => CreateCvgProductDto)
  @IsOptional()
  customer_groups?: CreateCvgProductDto;

  @ApiProperty({
    description: "Bulk pricing tiers",
    type: [CreateBulkPriceDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBulkPriceDto)
  @IsOptional()
  bulk_prices?: CreateBulkPriceDto[];
}
