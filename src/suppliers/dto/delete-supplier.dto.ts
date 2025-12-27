import { IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class DeleteSupplierDto {
  @ApiProperty({
    description: "Supplier ID",
    example: "uuid",
  })
  @IsUUID()
  id: string;
}
