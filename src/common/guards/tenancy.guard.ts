import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'

@Injectable()
export class TenancyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user
    const tenantId = request.tenantId || request.headers['x-tenant-id']

    if (!user) {
      return true // Let AuthGuard handle authentication
    }

    // SUPER_ADMIN can bypass tenant checks if needed, but usually they'll act within a tenant context
    if (user.role === 'SUPER_ADMIN') {
      return true
    }

    if (!tenantId || user.tenantId !== tenantId) {
      throw new ForbiddenException('You do not have access to this tenant')
    }

    return true
  }
}
