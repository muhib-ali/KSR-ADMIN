import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePromoCodeDto {
  @ApiProperty({
    description: "Promo code",
    example: "SAVE10",
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: "Discount percentage (0-100)",
    example: 10.00,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    description: "Usage limit",
    example: 100,
    required: false,
    nullable: true,
  })
  @IsNumber()
  @IsOptional()
  usageLimit?: number;

  @ApiProperty({
    description: "Expiration date",
    example: "2024-12-31T23:59:59.000Z",
    required: false,
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: Date;

  @ApiProperty({
    description: "Promo code active status",
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
