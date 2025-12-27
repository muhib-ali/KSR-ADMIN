import { IsUUID, IsNotEmpty, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCvgProductDto {
  @ApiProperty({
    description: "Customer visibility group IDs",
    example: ["123e4567-e89b-12d3-a456-426614174000"],
    isArray: true,
  })
  @IsArray()
  @IsUUID("all", { each: true })
  @IsNotEmpty()
  cvg_ids: string[];
}
