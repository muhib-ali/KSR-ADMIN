import { IsString, IsOptional, IsEmail, IsUUID, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateSupplierDto {
  @ApiProperty({
    description: "Supplier ID",
    example: "uuid",
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: "Supplier name",
    example: "ABC Supplies Ltd",
  })
  @IsString()
  @MaxLength(255)
  supplier_name: string;

  @ApiPropertyOptional({
    description: "Supplier email",
    example: "contact@abc.com",
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: "Supplier phone",
    example: "+1234567890",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    description: "Supplier address",
    example: "123 Main St, City, Country",
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: "Is supplier active",
    default: true,
  })
  @IsOptional()
  is_active?: boolean;
}
