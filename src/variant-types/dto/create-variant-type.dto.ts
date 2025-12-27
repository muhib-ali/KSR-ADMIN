import { IsString, IsNotEmpty, IsOptional, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateVariantTypeDto {
  @ApiProperty({
    description: "Variant type name",
    example: "Color",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: "Variant type active status",
    example: true,
    required: false,
  })
  @IsOptional()
  is_active?: boolean;
}
