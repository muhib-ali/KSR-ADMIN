import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCategoryDto {
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
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
