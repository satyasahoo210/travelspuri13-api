import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from '../prisma/prisma.service'

export const Feature = (featureName: string) =>
  SetMetadata('feature', featureName)

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const featureName = this.reflector.get<string>(
      'feature',
      context.getHandler(),
    )
    if (!featureName) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user
    if (user.role === 'SUPER_ADMIN') {
      return true // Super admins have access to all features
    }

    const tenantId = request.tenantId

    if (!tenantId) {
      throw new ForbiddenException('Tenant context required for this feature')
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { featureFlags: true },
    })

    if (!tenant || !tenant.featureFlags) {
      throw new ForbiddenException(
        `Feature ${featureName} is not enabled for this tenant`,
      )
    }

    const flags = tenant.featureFlags as Record<string, boolean>
    if (!flags[featureName]) {
      throw new ForbiddenException(
        `Feature ${featureName} is not enabled for this tenant`,
      )
    }

    return true
  }
}
