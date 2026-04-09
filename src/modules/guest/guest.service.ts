import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateGuestDto } from './dto/create-guest.dto';

@Injectable()
export class GuestService {
  constructor(private prisma: PrismaService) {}

  async create(createGuestDto: CreateGuestDto) {
    return this.prisma.guest.create({
      data: createGuestDto,
    });
  }

  async findAll() {
    return this.prisma.guest.findMany();
  }

  async findOne(id: string) {
    return this.prisma.guest.findUnique({
      where: { id },
    });
  }
}
