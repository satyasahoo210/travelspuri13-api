import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Roles } from '@/common/guards/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserRole } from '@/generated/prisma/client';
import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() createUserDto: CreateUserDto, @Request() req: any) {
    return this.userService.create(createUserDto, req.user);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  findAll(@Request() req: any) {
    return this.userService.findAll(req.user.tenantId, req.user.role);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Get a user by ID' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.userService.findOne(id, req.user.tenantId, req.user.role);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Delete a user' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.userService.remove(id, req.user.tenantId, req.user.role, req.user.id);
  }
}
