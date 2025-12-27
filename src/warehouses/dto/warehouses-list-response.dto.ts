import { ApiProperty } from "@nestjs/swagger";
import { WarehouseResponseDto } from "./warehouse-response.dto";

export class WarehousesListResponseDto {
  @ApiProperty({
    description: "List of warehouses",
    type: [WarehouseResponseDto],
  })
  data: WarehouseResponseDto[];

  @ApiProperty({
    description: "Current page number",
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: "Items per page",
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: "Total number of warehouses",
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: "Total number of pages",
    example: 3,
  })
  totalPages: number;
}
