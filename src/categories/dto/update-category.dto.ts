import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCategoryDto {
  @ApiProperty({
    description: "Category ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: "Category name",
    example: "General",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Category description",
    example: "General category",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "Category active status",
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
