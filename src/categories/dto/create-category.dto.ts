import { IsString, IsNotEmpty, IsOptional } from "class-validator";
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
}
