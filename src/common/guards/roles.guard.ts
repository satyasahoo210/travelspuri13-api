import { UserRole } from '@/generated/prisma/client'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    )
    if (!requiredRoles) {
      return true
    }

    let request;
    if (context.getType() as string === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context).getContext();
      request = gqlContext.req;
    } else {
      request = context.switchToHttp().getRequest();
    }

    const user = request?.user;
    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user.role === role)
  }
}
