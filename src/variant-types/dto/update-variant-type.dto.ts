import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateVariantTypeDto {
  @ApiProperty({
    description: "Variant type ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: "Variant type name",
    example: "Color",
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @ApiProperty({
    description: "Variant type active status",
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
