import { PrismaService } from '@/common/prisma/prisma.service'
import { SupabaseService } from '@/common/supabase/supabase.service'
import { UserRole } from '@/generated/prisma/client'
import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { CreateTenantDto } from './dto/create-tenant.dto'

@Injectable()
export class TenantService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  async create(createTenantDto: CreateTenantDto) {
    // Check if tenant email already exists
    if (createTenantDto.email) {
      const existing = await this.prisma.tenant.findUnique({
        where: { email: createTenantDto.email },
      })
      if (existing) {
        throw new ConflictException('Tenant with this email already exists')
      }
    }

    // Check if admin user email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createTenantDto.adminEmail },
    })
    if (existingUser) {
      throw new ConflictException('User with this admin email already exists')
    }

    // Create the tenant first. If user creation fails, we delete the tenant.
    const tenant = await this.prisma.tenant.create({
      data: {
        name: createTenantDto.name,
        email: createTenantDto.email,
        featureFlags: createTenantDto.featureFlags || {},
      },
    })

    try {
      const { data: authData, error: authError } = await this.supabaseService
        .getClient()
        .auth.admin.createUser({
          email: createTenantDto.adminEmail,
          password: createTenantDto.adminPassword,
          email_confirm: true,
          user_metadata: {
            name: createTenantDto.adminName,
            role: UserRole.TENANT_ADMIN,
            tenantId: tenant.id,
          },
        })

      if (authError) {
        throw new ConflictException(authError.message)
      }

      if (!authData.user) {
        throw new InternalServerErrorException('Failed to create auth user')
      }

      // The database trigger will automatically populate the public "User" table.
      const user = await this.prisma.user.findUnique({
        where: { id: authData.user.id },
      })

      return {
        tenant,
        adminUser: {
          email: user?.email || createTenantDto.adminEmail,
          name: user?.name || createTenantDto.adminName,
        },
      }
    } catch (err) {
      // Clean up the created tenant in case of errors
      await this.prisma.tenant.delete({
        where: { id: tenant.id },
      })
      throw err
    }
  }

  async findAll() {
    return this.prisma.tenant.findMany()
  }

  async findOne(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
    })
  }
}
