import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuditLogsService } from "../audit-logs.service";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, url, ip, headers } = request;

    return next.handle().pipe(
      tap(() => {
        // Record only mutating actions (Create, Update, Delete)
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
          // Skip logging for the audit logs themselves to avoid recursion or clutter
          if (url.includes('/audit-logs')) return;

          const actionMap: Record<string, string> = {
            POST: 'CREATE',
            PUT: 'UPDATE',
            PATCH: 'UPDATE',
            DELETE: 'DELETE',
          };

          const module = this.extractModuleName(url);
          const userId = user?.id || 'SYSTEM'; // Fallback if no user is set

          this.auditLogsService.logActivity({
            userId,
            action: actionMap[method] || method,
            module,
            ipAddress: ip,
            userAgent: headers['user-agent'],
          }).catch(err => {
            console.error('Audit Logging Error:', err);
          });
        }
      }),
    );
  }

  private extractModuleName(url: string): string {
    const parts = url.split('/').filter(p => p.length > 0);
    // Usually the first part of the URL is the module name (e.g., /products/getAll -> products)
    if (parts.length > 0) {
      const name = parts[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'Unknown';
  }
}
