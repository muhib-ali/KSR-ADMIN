import { IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class DeleteWarehouseDto {
  @ApiProperty({
    description: "Warehouse ID",
    example: "uuid",
  })
  @IsUUID()
  id: string;
}
