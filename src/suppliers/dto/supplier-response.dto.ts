import { ApiProperty } from "@nestjs/swagger";

export class SupplierResponseDto {
  @ApiProperty({
    description: "Supplier ID",
    example: "uuid",
  })
  id: string;

  @ApiProperty({
    description: "Supplier name",
    example: "ABC Supplies Ltd",
  })
  supplier_name: string;

  @ApiProperty({
    description: "Supplier email",
    example: "contact@abc.com",
  })
  email?: string;

  @ApiProperty({
    description: "Supplier phone",
    example: "+1234567890",
  })
  phone?: string;

  @ApiProperty({
    description: "Supplier address",
    example: "123 Main St, City, Country",
  })
  address?: string;

  @ApiProperty({
    description: "Is supplier active",
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
