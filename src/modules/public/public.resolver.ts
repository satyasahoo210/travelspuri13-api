import { Resolver, Query, Args } from '@nestjs/graphql';
import { PublicService } from './public.service';
import { PublicHotel, PublicRoom } from './dto/public-catalog.type';

@Resolver()
export class PublicResolver {
  constructor(private readonly publicService: PublicService) {}

  @Query(() => [PublicHotel])
  async getPublicHotels(): Promise<PublicHotel[]> {
    return this.publicService.getHotels() as any;
  }

  @Query(() => PublicHotel, { nullable: true })
  async getPublicHotelBySlug(@Args('slug') slug: string): Promise<PublicHotel | null> {
    try {
      return (await this.publicService.getHotelBySlug(slug)) as any;
    } catch (error) {
      return null;
    }
  }

  @Query(() => [PublicRoom])
  async getPublicRooms(@Args('hotelId') hotelId: string): Promise<PublicRoom[]> {
    return this.publicService.getRooms(hotelId) as any;
  }
}
