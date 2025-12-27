import { ApiProperty } from "@nestjs/swagger";

export class TaxResponseDto {
  @ApiProperty({
    description: "Tax ID",
    example: "uuid",
  })
  id: string;

  @ApiProperty({
    description: "Tax title",
    example: "VAT",
  })
  title: string;

  @ApiProperty({
    description: "Tax rate in percentage",
    example: 15.5,
  })
  rate: number;

  @ApiProperty({
    description: "Is tax active",
    example: true,
  })
  is_active: boolean;

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
