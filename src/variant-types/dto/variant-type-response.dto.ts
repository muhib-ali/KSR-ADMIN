import { ApiProperty } from "@nestjs/swagger";

export class VariantTypeDto {
  @ApiProperty({
    description: "Variant type ID",
    example: "uuid",
  })
  id: string;

  @ApiProperty({
    description: "Variant type name",
    example: "Color",
  })
  name: string;

  @ApiProperty({
    description: "Is variant type active",
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: "Created by user ID",
    example: "user-uuid",
    nullable: true,
  })
  created_by?: string;

  @ApiProperty({
    description: "Updated by user ID",
    example: "user-uuid",
    nullable: true,
  })
  updated_by?: string;

  @ApiProperty({
    description: "Created at",
    example: "2024-01-01T00:00:00Z",
  })
  created_at: string;

  @ApiProperty({
    description: "Updated at",
    example: "2024-01-01T00:00:00Z",
  })
  updated_at: string;
}

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
    type: VariantTypeDto,
  })
  data: VariantTypeDto;

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
      items: [VariantTypeDto],
      totalItems: 50,
      currentPage: 1,
      totalPages: 5,
      itemsPerPage: 10,
    },
  })
  data: {
    items: VariantTypeDto[];
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
