import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Roles } from '@/common/guards/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UserRole } from '@/generated/prisma/client';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DevDropdownsResponse, DevEntitiesResponse } from './dto/dev-db.type';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
export class DevDbResolver {
  constructor(private readonly prisma: PrismaService) {}

  private getTenantFilter(entity: string, tenantId: string): any {
    const modelName = entity.charAt(0).toUpperCase() + entity.slice(1);

    if (modelName === 'Room') {
      return { RoomType: { Property: { tenantId } } };
    }
    if (modelName === 'RoomType') {
      return { Property: { tenantId } };
    }
    if (modelName === 'BookingRoom') {
      return { Booking: { tenantId } };
    }
    if (modelName === 'BookingService') {
      return { Booking: { tenantId } };
    }
    if (modelName === 'UserProperty') {
      return { Property: { tenantId } };
    }
    if (modelName === 'Tenant') {
      return { id: tenantId };
    }

    return { tenantId };
  }

  @Query(() => DevEntitiesResponse)
  async devEntities(
    @Args('entity') entity: string,
    @Args('page', { type: () => Int }) page: number,
    @Args('limit', { type: () => Int }) limit: number,
    @CurrentUser() user: any,
    @Args('search', { nullable: true }) search?: string,
  ): Promise<DevEntitiesResponse> {
    const model = entity.charAt(0).toLowerCase() + entity.slice(1);
    const dbModel = (this.prisma as any)[model];
    if (!dbModel) {
      throw new Error(`Model ${entity} not found`);
    }

    const searchFields: Record<string, string[]> = {
      Property: ['name', 'address'],
      RoomType: ['name'],
      Room: ['roomNumber'],
      Employee: ['name', 'email'],
      Guest: ['name', 'phone', 'email'],
      Service: ['name'],
      Product: ['name', 'category'],
      Order: ['tableNumber'],
      Expense: ['category', 'description'],
      Message: ['content'],
    };

    const where: any = {};
    if (search && searchFields[entity]) {
      where.OR = searchFields[entity].map((field) => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      }));
    }

    if (user.role !== UserRole.SUPER_ADMIN) {
      Object.assign(where, this.getTenantFilter(entity, user.tenantId));
    }

    const include: any = {};
    if (entity === 'Room') include.RoomType = true;
    if (entity === 'Booking') include.Guest = true;
    if (entity === 'Order') include.Booking = { include: { Guest: true } };
    if (entity === 'RoomType') include.Property = true;

    const count = await dbModel.count({ where });
    const data = await dbModel.findMany({
      where,
      ...(Object.keys(include).length > 0 && { include }),
      orderBy: { createdAt: 'desc' },
      skip: page * limit,
      take: limit,
    });

    return {
      dataJson: JSON.stringify(data),
      count,
    };
  }

  @Query(() => DevDropdownsResponse)
  async devDropdowns(@CurrentUser() user: any): Promise<DevDropdownsResponse> {
    const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
    const tenantId = user.tenantId;

    const properties = await this.prisma.property.findMany({
      where: isSuperAdmin ? undefined : this.getTenantFilter('property', tenantId ),
    });
    const roomTypes = await this.prisma.roomType.findMany({
      where: isSuperAdmin ? undefined : this.getTenantFilter('roomType', tenantId ),
    });
    const guests = await this.prisma.guest.findMany({
      where: isSuperAdmin ? undefined : this.getTenantFilter('guest', tenantId ),
      orderBy: { name: 'asc' },
    });
    const products = await this.prisma.product.findMany({
      where: isSuperAdmin ? undefined : this.getTenantFilter('product', tenantId ),
    });
    const rooms = await this.prisma.room.findMany({
      where: isSuperAdmin ? undefined : this.getTenantFilter('room', tenantId ),
      include: { RoomType: true },
    });
    const bookings = await this.prisma.booking.findMany({
      where: isSuperAdmin ? undefined : this.getTenantFilter('booking', tenantId ),
      include: { Guest: true },
    });

    return {
      properties: JSON.stringify(properties),
      roomTypes: JSON.stringify(roomTypes),
      guests: JSON.stringify(guests),
      products: JSON.stringify(products),
      rooms: JSON.stringify(rooms),
      bookings: JSON.stringify(bookings),
    };
  }

  @Mutation(() => String)
  async devInsert(
    @Args('entity') entity: string,
    @Args('dataJson') dataJson: string,
    @CurrentUser() user: any,
  ): Promise<string> {
    const model = entity.charAt(0).toLowerCase() + entity.slice(1);
    const dbModel = (this.prisma as any)[model];
    if (!dbModel) {
      throw new Error(`Model ${entity} not found`);
    }

    const data = JSON.parse(dataJson);
    const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;

    const sanitizeAndValidate = async (item: any) => {
      if (!isSuperAdmin) {
        const modelName = entity.charAt(0).toUpperCase() + entity.slice(1);

        // 1. Direct tenantId check or assignment
        if (
          modelName !== 'Room' &&
          modelName !== 'RoomType' &&
          modelName !== 'BookingRoom' &&
          modelName !== 'BookingService' &&
          modelName !== 'UserProperty' &&
          modelName !== 'Tenant'
        ) {
          item.tenantId = user.tenantId;
        }

        // 2. Relation validation
        if (modelName === 'Room') {
          if (!item.roomTypeId) throw new Error('roomTypeId is required');
          const roomType = await this.prisma.roomType.findFirst({
            where: { id: item.roomTypeId, ...this.getTenantFilter('roomType', user.tenantId ) },
          });
          if (!roomType) throw new Error('Invalid roomTypeId for your tenant');
        } else if (modelName === 'RoomType') {
          if (!item.propertyId) throw new Error('propertyId is required');
          const property = await this.prisma.property.findFirst({
            where: { id: item.propertyId, ...this.getTenantFilter('property', user.tenantId ) },
          });
          if (!property) throw new Error('Invalid propertyId for your tenant');
        } else if (modelName === 'BookingRoom') {
          if (!item.bookingId) throw new Error('bookingId is required');
          const booking = await this.prisma.booking.findFirst({
            where: { id: item.bookingId, ...this.getTenantFilter('booking', user.tenantId ) },
          });
          if (!booking) throw new Error('Invalid bookingId for your tenant');

          if (item.roomTypeId) {
            const roomType = await this.prisma.roomType.findFirst({
              where: { id: item.roomTypeId, ...this.getTenantFilter('roomType', user.tenantId ) },
            });
            if (!roomType) throw new Error('Invalid roomTypeId for your tenant');
          }
          if (item.roomId) {
            const room = await this.prisma.room.findFirst({
              where: { id: item.roomId, ...this.getTenantFilter('room', user.tenantId ) },
            });
            if (!room) throw new Error('Invalid roomId for your tenant');
          }
        } else if (modelName === 'BookingService') {
          if (!item.bookingId) throw new Error('bookingId is required');
          const booking = await this.prisma.booking.findFirst({
            where: { id: item.bookingId, ...this.getTenantFilter('booking', user.tenantId ) },
          });
          if (!booking) throw new Error('Invalid bookingId for your tenant');

          if (item.serviceId) {
            const service = await this.prisma.service.findFirst({
              where: { id: item.serviceId, ...this.getTenantFilter('service', user.tenantId ) },
            });
            if (!service) throw new Error('Invalid serviceId for your tenant');
          }
        } else if (modelName === 'UserProperty') {
          if (item.propertyId) {
            const property = await this.prisma.property.findFirst({
              where: { id: item.propertyId, ...this.getTenantFilter('property', user.tenantId ) },
            });
            if (!property) throw new Error('Invalid propertyId for your tenant');
          }
          if (item.userId) {
            const dbUser = await this.prisma.user.findFirst({
              where: { id: item.userId, ...this.getTenantFilter('user', user.tenantId ) },
            });
            if (!dbUser) throw new Error('Invalid userId for your tenant');
          }
        } else if (modelName === 'Tenant') {
          throw new ForbiddenException('Tenant creation not allowed for non-super admins');
        }
      }
      return item;
    };

    if (Array.isArray(data)) {
      const results: any[] = [];
      for (const item of data) {
        const sanitizedItem = await sanitizeAndValidate(item);
        results.push(await dbModel.create({ data: sanitizedItem }));
      }
      return JSON.stringify(results);
    } else {
      const sanitizedData = await sanitizeAndValidate(data);
      const result = await dbModel.create({ data: sanitizedData });
      return JSON.stringify(result);
    }
  }

  @Mutation(() => String)
  async devUpdate(
    @Args('entity') entity: string,
    @Args('id') id: string,
    @Args('dataJson') dataJson: string,
    @CurrentUser() user: any,
  ): Promise<string> {
    const model = entity.charAt(0).toLowerCase() + entity.slice(1);
    const dbModel = (this.prisma as any)[model];
    if (!dbModel) {
      throw new Error(`Model ${entity} not found`);
    }

    const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
    const data = JSON.parse(dataJson);

    if (!isSuperAdmin) {
      const filter = this.getTenantFilter(entity, user.tenantId);
      const count = await dbModel.count({
        where: { id, ...filter },
      });
      if (count === 0) {
        throw new ForbiddenException('Record not found or access denied');
      }

      if (data.tenantId && data.tenantId !== user.tenantId) {
        throw new Error('Cannot change tenantId');
      }

      const modelName = entity.charAt(0).toUpperCase() + entity.slice(1);
      if (modelName === 'Room' && data.roomTypeId) {
        const roomType = await this.prisma.roomType.findFirst({
          where: { id: data.roomTypeId, ...this.getTenantFilter('roomType', user.tenantId ) },
        });
        if (!roomType) throw new Error('Invalid roomTypeId for your tenant');
      } else if (modelName === 'RoomType' && data.propertyId) {
        const property = await this.prisma.property.findFirst({
          where: { id: data.propertyId, ...this.getTenantFilter('property', user.tenantId ) },
        });
        if (!property) throw new Error('Invalid propertyId for your tenant');
      } else if (modelName === 'BookingRoom') {
        if (data.bookingId) {
          const booking = await this.prisma.booking.findFirst({
            where: { id: data.bookingId, ...this.getTenantFilter('booking', user.tenantId ) },
          });
          if (!booking) throw new Error('Invalid bookingId for your tenant');
        }
        if (data.roomTypeId) {
          const roomType = await this.prisma.roomType.findFirst({
            where: { id: data.roomTypeId, ...this.getTenantFilter('roomType', user.tenantId ) },
          });
          if (!roomType) throw new Error('Invalid roomTypeId for your tenant');
        }
        if (data.roomId) {
          const room = await this.prisma.room.findFirst({
            where: { id: data.roomId, ...this.getTenantFilter('room', user.tenantId ) },
          });
          if (!room) throw new Error('Invalid roomId for your tenant');
        }
      } else if (modelName === 'BookingService') {
        if (data.bookingId) {
          const booking = await this.prisma.booking.findFirst({
            where: { id: data.bookingId, ...this.getTenantFilter('booking', user.tenantId ) },
          });
          if (!booking) throw new Error('Invalid bookingId for your tenant');
        }
        if (data.serviceId) {
          const service = await this.prisma.service.findFirst({
            where: { id: data.serviceId, ...this.getTenantFilter('service', user.tenantId ) },
          });
          if (!service) throw new Error('Invalid serviceId for your tenant');
        }
      } else if (modelName === 'UserProperty') {
        if (data.propertyId) {
          const property = await this.prisma.property.findFirst({
            where: { id: data.propertyId, ...this.getTenantFilter('property', user.tenantId ) },
          });
          if (!property) throw new Error('Invalid propertyId for your tenant');
        }
        if (data.userId) {
          const dbUser = await this.prisma.user.findFirst({
            where: { id: data.userId, ...this.getTenantFilter('user', user.tenantId ) },
          });
          if (!dbUser) throw new Error('Invalid userId for your tenant');
        }
      }
    }

    const result = await dbModel.update({
      where: { id },
      data,
    });
    return JSON.stringify(result);
  }

  @Mutation(() => String)
  async devDelete(
    @Args('entity') entity: string,
    @Args('id') id: string,
    @CurrentUser() user: any,
  ): Promise<string> {
    const model = entity.charAt(0).toLowerCase() + entity.slice(1);
    const dbModel = (this.prisma as any)[model];
    if (!dbModel) {
      throw new Error(`Model ${entity} not found`);
    }

    const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;

    if (!isSuperAdmin) {
      const filter = this.getTenantFilter(entity, user.tenantId);
      const count = await dbModel.count({
        where: { id, ...filter },
      });
      if (count === 0) {
        throw new ForbiddenException('Record not found or access denied');
      }
    }

    const result = await dbModel.delete({
      where: { id },
    });
    return JSON.stringify(result);
  }
}
