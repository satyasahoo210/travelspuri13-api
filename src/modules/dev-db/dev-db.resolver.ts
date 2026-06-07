import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/guards/roles.decorator';
import { UserRole } from '@/generated/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { DevEntitiesResponse, DevDropdownsResponse } from './dto/dev-db.type';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
export class DevDbResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => DevEntitiesResponse)
  async devEntities(
    @Args('entity') entity: string,
    @Args('page', { type: () => Int }) page: number,
    @Args('limit', { type: () => Int }) limit: number,
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
  async devDropdowns(): Promise<DevDropdownsResponse> {
    const properties = await this.prisma.property.findMany();
    const roomTypes = await this.prisma.roomType.findMany();
    const guests = await this.prisma.guest.findMany({ orderBy: { name: 'asc' } });
    const products = await this.prisma.product.findMany();
    const rooms = await this.prisma.room.findMany({ include: { RoomType: true } });
    const bookings = await this.prisma.booking.findMany({ include: { Guest: true } });

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
  ): Promise<string> {
    const model = entity.charAt(0).toLowerCase() + entity.slice(1);
    const dbModel = (this.prisma as any)[model];
    if (!dbModel) {
      throw new Error(`Model ${entity} not found`);
    }

    const data = JSON.parse(dataJson);
    if (Array.isArray(data)) {
      const results: any[] = [];
      for (const item of data) {
        results.push(await dbModel.create({ data: item }));
      }
      return JSON.stringify(results);
    } else {
      const result = await dbModel.create({ data });
      return JSON.stringify(result);
    }
  }

  @Mutation(() => String)
  async devUpdate(
    @Args('entity') entity: string,
    @Args('id') id: string,
    @Args('dataJson') dataJson: string,
  ): Promise<string> {
    const model = entity.charAt(0).toLowerCase() + entity.slice(1);
    const dbModel = (this.prisma as any)[model];
    if (!dbModel) {
      throw new Error(`Model ${entity} not found`);
    }

    const data = JSON.parse(dataJson);
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
  ): Promise<string> {
    const model = entity.charAt(0).toLowerCase() + entity.slice(1);
    const dbModel = (this.prisma as any)[model];
    if (!dbModel) {
      throw new Error(`Model ${entity} not found`);
    }

    const result = await dbModel.delete({
      where: { id },
    });
    return JSON.stringify(result);
  }
}
