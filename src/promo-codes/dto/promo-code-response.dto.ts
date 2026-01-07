import { ApiProperty } from "@nestjs/swagger";

export class PromoCodeDto {
  @ApiProperty({
    description: "Promo code ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Promo code",
    example: "SAVE10",
  })
  code: string;

  @ApiProperty({
    description: "Discount percentage",
    example: 10.00,
  })
  value: number;

  @ApiProperty({
    description: "Usage limit",
    example: 100,
    nullable: true,
  })
  usage_limit: number | null;

  @ApiProperty({
    description: "Current usage count",
    example: 25,
  })
  usage_count: number;

  @ApiProperty({
    description: "Expiration date",
    example: "2024-12-31T23:59:59.000Z",
    nullable: true,
  })
  expires_at: Date | null;

  @ApiProperty({
    description: "Is promo code active",
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

export class PromoCodeResponseDto {
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
    example: "Promo code retrieved successfully",
  })
  message: string;

  @ApiProperty({
    description: "Promo code heading",
    example: "Promo Code",
  })
  heading: string;

  @ApiProperty({
    description: "Promo code data",
    type: PromoCodeDto,
  })
  data: PromoCodeDto;
}

export class PromoCodesListResponseDto {
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
    example: "Promo codes retrieved successfully",
  })
  message: string;

  @ApiProperty({
    description: "Promo code heading",
    example: "Promo Code",
  })
  heading: string;

  @ApiProperty({
    description: "Promo codes data with pagination",
    type: "object",
    properties: {
      promoCodes: {
        type: "array",
        items: { $ref: "#/components/schemas/PromoCodeDto" },
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
    promoCodes: PromoCodeDto[];
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
