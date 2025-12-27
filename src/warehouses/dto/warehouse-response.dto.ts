import { ApiProperty } from "@nestjs/swagger";

export class WarehouseResponseDto {
  @ApiProperty({
    description: "Warehouse ID",
    example: "uuid",
  })
  id: string;

  @ApiProperty({
    description: "Warehouse name",
    example: "Main Warehouse",
  })
  name: string;

  @ApiProperty({
    description: "Warehouse code",
    example: "MW001",
  })
  code: string;

  @ApiProperty({
    description: "Warehouse address",
    example: "123 Storage St, City, Country",
  })
  address?: string;

  @ApiProperty({
    description: "Warehouse active status",
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: "Created by",
    example: "user-uuid",
  })
  created_by?: string;

  @ApiProperty({
    description: "Updated by",
    example: "user-uuid",
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
