import { ApiProperty } from "@nestjs/swagger";
import { VariantType } from "../../entities/variant-type.entity";
import { Variant } from "../../entities/variant.entity";

export class VariantTypeResponseDto {
  @ApiProperty({
    description: "Response status",
    example: true,
  })
  status: boolean;

  @ApiProperty({
    description: "Response message",
    example: "Variant type retrieved successfully",
  })
  message: string;

  @ApiProperty({
    description: "Response heading",
    example: "VariantType",
  })
  heading: string;

  @ApiProperty({
    description: "Response data",
    type: VariantType,
  })
  data: VariantType;

  @ApiProperty({
    description: "HTTP status code",
    example: 200,
  })
  statusCode: number;
}

export class VariantTypesListResponseDto {
  @ApiProperty({
    description: "Response status",
    example: true,
  })
  status: boolean;

  @ApiProperty({
    description: "Response message",
    example: "Variant types retrieved successfully",
  })
  message: string;

  @ApiProperty({
    description: "Response heading",
    example: "VariantType",
  })
  heading: string;

  @ApiProperty({
    description: "Response data with pagination",
    example: {
      items: [VariantType],
      totalItems: 50,
      currentPage: 1,
      totalPages: 5,
      itemsPerPage: 10,
    },
  })
  data: {
    items: VariantType[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
  };

  @ApiProperty({
    description: "HTTP status code",
    example: 200,
  })
  statusCode: number;
}
