import { IsString, IsOptional, IsBoolean, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateWarehouseDto {
  @ApiProperty({
    description: "Warehouse name",
    example: "Main Warehouse",
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: "Warehouse code (unique)",
    example: "MW001",
  })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({
    description: "Warehouse address",
    example: "123 Storage St, City, Country",
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: "Warehouse active status",
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
