import { IsNumber, IsNotEmpty, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateBulkPriceDto {
  @ApiProperty({
    description: "Minimum quantity for bulk pricing",
    example: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: "Price per product for this quantity",
    example: 15.99,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price_per_product: number;
}
