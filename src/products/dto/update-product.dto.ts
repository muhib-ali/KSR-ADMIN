import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsInt,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

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
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiProperty({
    description: "Available stock quantity",
    example: 50,
  })
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
    example: "https://example.com/images/product.png",
    required: false,
  })
  @IsString()
  @IsOptional()
  product_img_url?: string;
}
