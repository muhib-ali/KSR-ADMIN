import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class GetAuditLogsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: "Filter by User Email",
    example: "arsalan@arcsol.com",
  })
  @IsOptional()
  @IsString()
  userEmail?: string; // Changed from userId to userEmail

  @ApiPropertyOptional({
    description: "Filter by Module name",
    example: "Products",
  })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({
    description: "Filter by Action type",
    example: "CREATE",
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    description: "Filter from Start Date (ISO format)",
    example: "2024-03-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "Filter to End Date (ISO format)",
    example: "2024-03-28T23:59:59.999Z",
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
