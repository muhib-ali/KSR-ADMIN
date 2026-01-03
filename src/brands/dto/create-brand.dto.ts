import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateBrandDto {
  @ApiProperty({
    description: "Brand name",
    example: "Toyota",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Brand description",
    example: "Automotive brand",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "Brand active status",
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
