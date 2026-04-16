import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserActivity } from "../entities/user-activity.entity";
import { AuditLogsService } from "./audit-logs.service";
import { AuditLogsController } from "./audit-logs.controller";

@Module({
  imports: [TypeOrmModule.forFeature([UserActivity])],
  controllers: [AuditLogsController],
  providers: [AuditLogsService],
  exports: [AuditLogsService], // Export so other modules can use it (e.g., AuthService)
})
export class AuditLogsModule {}
