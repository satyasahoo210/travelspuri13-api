import { PrismaService } from '@/common/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async getHotels() {
    const properties = await this.prisma.property.findMany({
      include: {
        RoomType: true,
      },
    });

    const hotels = properties.map((property) => this.mapPropertyToHotel(property));

    // Sort sponsored first
    return hotels.sort((a, b) => (b.is_sponsored ? 1 : 0) - (a.is_sponsored ? 1 : 0));
  }

  async getHotelBySlug(slug: string) {
    const properties = await this.prisma.property.findMany({
      include: {
        RoomType: true,
      },
    });

    const property = properties.find(
      (p) => p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === slug,
    );

    if (!property) {
      throw new NotFoundException(`Hotel with slug ${slug} not found`);
    }

    return this.mapPropertyToHotel(property);
  }

  async getRooms(propertyId: string) {
    const roomTypes = await this.prisma.roomType.findMany({
      where: { propertyId },
    });

    return roomTypes.map((rt) => this.mapRoomTypeToRoom(rt));
  }

  private mapPropertyToHotel(property: any) {
    const settings = (property.settings as any) || {};
    const slug = property.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let startingPrice = 0;
    if (property.roomTypes && property.roomTypes.length > 0) {
      const prices = property.roomTypes.map((rt) => Number(rt.defaultPrice));
      startingPrice = Math.min(...prices);
    }

    return {
      id: property.id,
      name: property.name,
      slug: slug,
      location: property.address,
      area: settings.area || property.address,
      lat: settings.lat || 0,
      lng: settings.lng || 0,
      rating: settings.rating || 4.5,
      rating_count: settings.rating_count || 10,
      starting_price: startingPrice,
      amenities: settings.amenities || '',
      amenities_search: settings.amenities
        ? settings.amenities.toLowerCase().replace(/,/g, ' ')
        : '',
      cover_image: property.logoUrl || (property.photos && property.photos[0]) || '',
      image_urls: property.photos || [],
      is_sponsored: settings.is_sponsored === true || settings.is_sponsored === 'TRUE',
      is_active: true,
      created_at: property.createdAt.toISOString(),
    };
  }

  private mapRoomTypeToRoom(roomType: any) {
    const settings = (roomType.settings as any) || {};
    return {
      id: roomType.id,
      hotel_id: roomType.propertyId,
      name: roomType.name,
      description: settings.description || roomType.name,
      price: Number(roomType.defaultPrice),
      capacity: roomType.capacity,
      amenities: settings.amenities || '',
      amenities_search: settings.amenities
        ? settings.amenities.toLowerCase().replace(/,/g, ' ')
        : '',
      image_urls: roomType.photos || [],
      check_in: settings.check_in || '12:00 PM',
      check_out: settings.check_out || '11:00 AM',
      rules: settings.rules || 'Standard rules apply.',
      cancellation_policy: settings.cancellation_policy || 'No refund within 24 hours of check-in.',
      is_active: true,
    };
  }
}
