import {
  IsString,
  IsNotEmpty,
  IsNumber,
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
    description: "Product ID (UUID)",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  product_id: string;
}
