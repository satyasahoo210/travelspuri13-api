import { PrismaService } from '@/common/prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    const publicKey = process.env.SUPABASE_JWT_PUBLIC_KEY
      ? process.env.SUPABASE_JWT_PUBLIC_KEY.replace(/\\n/g, '\n')
      : (process.env.JWT_SECRET || 'supersecret');

    const algorithms = process.env.SUPABASE_JWT_PUBLIC_KEY
      ? ['ES256']
      : ['HS256'];

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: algorithms as any,
    })
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user) {
      throw new UnauthorizedException()
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    }
  }
}
