import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, ILike } from "typeorm";
import { UserActivity } from "../entities/user-activity.entity";
import { ResponseHelper } from "../common/helpers/response.helper";

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(UserActivity)
    private readonly activityRepository: Repository<UserActivity>
  ) {}

  /**
   * Records a user activity in the audit log.
   */
  async logActivity(data: {
    userId: string;
    action: string;
    module?: string;
    ipAddress?: string;
    userAgent?: string;
    loginTime?: Date;
    logoutTime?: Date;
    details?: any;
  }) {
    const activity = this.activityRepository.create({
      user_id: data.userId,
      action: data.action,
      module: data.module,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
      login_time: data.loginTime,
      logout_time: data.logoutTime,
      details: data.details,
    });

    return await this.activityRepository.save(activity);
  }

  /**
   * Retrieves activity logs with pagination and filtering.
   */
  async getLogs(query: {
    userEmail?: string; // Changed from userId to userEmail
    module?: string;
    action?: string;
    page: number;
    limit: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { userEmail, module, action, page, limit, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userEmail) {
      where.user = { email: ILike(`%${userEmail}%`) }; // Filtering via relation with ILike
    }
    if (module) where.module = module;
    if (action) where.action = action;

    // Optimized Date Filtering: Ensures the entire day is included
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start) {
        start.setHours(0, 0, 0, 0);
      }
      if (end) {
        // Set end date to the very last millisecond of the day
        end.setHours(23, 59, 59, 999);
      }

      if (start && end) {
        where.created_at = Between(start, end);
      } else if (start) {
        where.created_at = MoreThanOrEqual(start);
      } else if (end) {
        where.created_at = LessThanOrEqual(end);
      }
    }

    const [items, total] = await this.activityRepository.findAndCount({
      where,
      relations: ["user"],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
      order: { created_at: "DESC" },
      skip,
      take: limit,
    });

    // Format results to clean up User Agent for specialized display
    const formattedItems = items.map((item) => ({
      ...item,
      user_agent: this.formatUserAgent(item.user_agent),
    }));

    return ResponseHelper.paginated(
      formattedItems,
      page,
      limit,
      total,
      "activities",
      "Audit logs retrieved successfully",
      "Audit Logs"
    );
  }

  /**
   * Helper to turn long Mozilla User-Agent strings into simple names (e.g., Chrome - Windows)
   */// only to make user agent in repsonse clean
  private formatUserAgent(ua: string): string {
    if (!ua) return "Unknown";
    if (ua === "node") return "System/Local";

    let browser = "Other Browser";
    let os = "Unknown OS";

    // Basic Browser Detection
    if (ua.includes("Edg/")) browser = "Microsoft Edge";
    else if (ua.includes("Chrome/")) browser = "Google Chrome";
    else if (ua.includes("Firefox/")) browser = "Firefox";
    else if (ua.includes("Safari/") && !ua.includes("Chrome/")) browser = "Safari";

    // Basic OS Detection
    if (ua.includes("Windows NT")) os = "Windows";
    else if (ua.includes("Mac OS X")) os = "macOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Linux")) os = "Linux";

    return `${browser} (${os})`;
  }
}
