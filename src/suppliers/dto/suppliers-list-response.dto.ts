import { ApiProperty } from "@nestjs/swagger";
import { SupplierResponseDto } from "./supplier-response.dto";

export class SuppliersListResponseDto {
  @ApiProperty({
    description: "List of suppliers",
    type: [SupplierResponseDto],
  })
  data: SupplierResponseDto[];

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
    description: "Total number of suppliers",
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: "Total number of pages",
    example: 3,
  })
  totalPages: number;
}
