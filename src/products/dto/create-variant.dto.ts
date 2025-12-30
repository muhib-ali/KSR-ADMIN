import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateVariantDto {
  @ApiProperty({
    description: "Variant type ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  vtype_id: string;

  @ApiProperty({
    description: "Variant value",
    example: "XL",
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    description: "Product ID (UUID) - Optional for create operation, will be set by backend",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsUUID()
  @IsOptional()
  product_id?: string;
}
