import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateBrandDto {
  @ApiProperty({
    description: "Brand ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

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
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
