import { IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class DeleteTaxDto {
  @ApiProperty({
    description: "Tax ID",
    example: "uuid",
  })
  @IsUUID()
  id: string;
}
