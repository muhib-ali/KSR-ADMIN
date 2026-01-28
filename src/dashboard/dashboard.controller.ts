import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";

@ApiTags("Dashboard")
@ApiBearerAuth("JWT-auth")
@Controller("dashboard")
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get("getOverview")
  @ApiOperation({ summary: "Get dashboard overview" })
  @ApiResponse({ status: 200 })
  async getOverview() {
    return this.dashboardService.getOverview();
  }
}
