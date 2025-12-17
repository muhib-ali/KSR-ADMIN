import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "./pagination.dto";

export class SearchPaginationDto extends PaginationDto {
  @ApiPropertyOptional({
    description: "Search term",
    example: "nike",
  })
  @IsOptional()
  @IsString()
  search?: string;
}
