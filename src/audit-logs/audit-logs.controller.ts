import {
  Controller,
  Get,
  Query,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuditLogsService } from "./audit-logs.service";
import { GetAuditLogsDto } from "./dto/get-audit-logs.dto";

@ApiTags("Audit Logs")
@ApiBearerAuth("JWT-auth")
@Controller("audit-logs")
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get("getAll")
  @ApiOperation({ summary: "Get all user activity logs with filtering and pagination" })
  async getLogs(@Query(new ValidationPipe({ transform: true })) query: GetAuditLogsDto) {
    return await this.auditLogsService.getLogs({
      userEmail: query.userEmail, // Changed from userId to userEmail
      module: query.module,
      action: query.action,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page || 1,
      limit: query.limit || 10,
    });
  }
}
