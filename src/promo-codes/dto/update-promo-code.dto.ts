import { PartialType } from "@nestjs/swagger";
import { CreatePromoCodeDto } from "./create-promo-code.dto";
import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePromoCodeDto extends PartialType(CreatePromoCodeDto) {
  @ApiProperty({
    description: "Promo code ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
