import { ApiProperty } from "@nestjs/swagger";

export class BrandDto {
  @ApiProperty({
    description: "Brand ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Brand name",
    example: "Toyota",
  })
  name: string;

  @ApiProperty({
    description: "Brand description",
    example: "Automotive brand",
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: "Is brand active",
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: "Created by user ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    nullable: true,
  })
  created_by: string | null;

  @ApiProperty({
    description: "Updated by user ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    nullable: true,
  })
  updated_by: string | null;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  })
  created_at: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2024-01-01T00:00:00.000Z",
  })
  updated_at: Date;
}

export class BrandResponseDto {
  @ApiProperty({
    description: "Status code",
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: "Operation status",
    example: true,
  })
  status: boolean;

  @ApiProperty({
    description: "Response message",
    example: "Brand retrieved successfully",
  })
  message: string;

  @ApiProperty({
    description: "Brand heading",
    example: "Brand",
  })
  heading: string;

  @ApiProperty({
    description: "Brand data",
    type: BrandDto,
  })
  data: BrandDto;
}

export class BrandsListResponseDto {
  @ApiProperty({
    description: "Status code",
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: "Operation status",
    example: true,
  })
  status: boolean;

  @ApiProperty({
    description: "Response message",
    example: "Brands retrieved successfully",
  })
  message: string;

  @ApiProperty({
    description: "Brand heading",
    example: "Brand",
  })
  heading: string;

  @ApiProperty({
    description: "Brands data with pagination",
    type: "object",
    properties: {
      brands: {
        type: "array",
        items: { $ref: "#/components/schemas/BrandDto" },
      },
      pagination: {
        type: "object",
        properties: {
          page: { type: "number", example: 1 },
          limit: { type: "number", example: 10 },
          total: { type: "number", example: 50 },
          totalPages: { type: "number", example: 5 },
          hasNext: { type: "boolean", example: true },
          hasPrev: { type: "boolean", example: false },
          nextPage: { type: "number", example: 2, nullable: true },
          prevPage: { type: "number", example: null, nullable: true },
        },
      },
    },
  })
  data: {
    brands: BrandDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
      nextPage: number | null;
      prevPage: number | null;
    };
  };
}
