import { PrismaService } from '@/common/prisma/prisma.service'
import { SupabaseService } from '@/common/supabase/supabase.service'
import { UserRole } from '@/generated/prisma/client'
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser: any) {
    // RBAC: Check if current user can create the requested role
    const effectiveTenantId =
      currentUser.role === UserRole.SUPER_ADMIN
        ? createUserDto.tenantId
        : currentUser.tenantId

    if (!effectiveTenantId) {
      throw new ForbiddenException('Tenant ID is required')
    }

    // TENANT_ADMIN can only create PROPERTY_MANAGER and STAFF
    if (currentUser.role === UserRole.TENANT_ADMIN) {
      if (
        !([UserRole.PROPERTY_MANAGER, UserRole.STAFF] as UserRole[]).includes(
          createUserDto.role,
        )
      ) {
        throw new ForbiddenException(
          'You can only create PROPERTY_MANAGER or STAFF roles',
        )
      }
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    })
    if (existingUser) {
      throw new ConflictException('User with this email already exists')
    }

    const { data: authData, error: authError } = await this.supabaseService
      .getClient()
      .auth.admin.createUser({
        email: createUserDto.email,
        password: createUserDto.password,
        email_confirm: true,
        user_metadata: {
          name: createUserDto.name,
          role: createUserDto.role,
          tenantId: effectiveTenantId,
        },
      })

    if (authError) {
      throw new ConflictException(authError.message)
    }

    if (!authData.user) {
      throw new InternalServerErrorException('Failed to create auth user')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: authData.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new InternalServerErrorException('User profile could not be retrieved')
    }

    return user
  }

  async findAll(tenantId: string, role: UserRole) {
    const where: any = {}
    if (role !== UserRole.SUPER_ADMIN) {
      where.tenantId = tenantId
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    })
  }

  async findOne(id: string, tenantId: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (role !== UserRole.SUPER_ADMIN && user.tenantId !== tenantId) {
      throw new ForbiddenException('You do not have access to this user')
    }

    return user
  }

  async remove(id: string, tenantId: string, role: UserRole, requestingUserId: string) {
    const user = await this.findOne(id, tenantId, role)

    if (user.role === UserRole.SUPER_ADMIN && role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('You cannot delete a SUPER_ADMIN')
    }

    if (user.id === requestingUserId) {
      throw new ForbiddenException('You cannot delete yourself')
    }

    return this.prisma.user.delete({
      where: { id },
    })
  }
}
