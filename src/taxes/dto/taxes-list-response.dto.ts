import { ApiProperty } from "@nestjs/swagger";
import { TaxResponseDto } from "./tax-response.dto";

export class TaxesListResponseDto {
  @ApiProperty({
    description: "List of taxes",
    type: [TaxResponseDto],
  })
  data: TaxResponseDto[];

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
    description: "Total number of taxes",
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: "Total number of pages",
    example: 3,
  })
  totalPages: number;
}
