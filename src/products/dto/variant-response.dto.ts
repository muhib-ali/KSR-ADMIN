import { ApiProperty } from "@nestjs/swagger";

export class VariantResponseDto {
  @ApiProperty({
    description: "Variant ID",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "Variant type ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  vtype_id: string;

  @ApiProperty({
    description: "Variant value",
    example: "XL",
  })
  value: string;

  @ApiProperty({
    description: "Product ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  product_id: string;

  @ApiProperty({
    description: "Variant type details",
    example: {
      id: 1,
      name: "size"
    }
  })
  variantType?: {
    id: string;
    name: string;
  };
}
