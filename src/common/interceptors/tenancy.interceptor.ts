import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenancyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;

    if (!tenantId) {
      // For some public routes, tenantId might not be required, 
      // but for most PMS actions, it is essential.
      // We'll allow it here and let the TenancyGuard handle strict enforcement on protected routes.
    }

    request.tenantId = tenantId;
    return next.handle();
  }
}
