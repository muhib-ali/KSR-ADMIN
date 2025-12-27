import { IsString, IsNumber, IsOptional, IsBoolean, Max, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTaxDto {
  @ApiProperty({
    description: "Tax title",
    example: "VAT",
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: "Tax rate in percentage",
    example: 15.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  rate: number;

  @ApiPropertyOptional({
    description: "Is tax active",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
