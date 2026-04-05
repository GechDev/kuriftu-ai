import { nightCount } from "./dates.js";

const resortSelect = {
  id: true,
  name: true,
  slug: true,
  region: true,
  shortDescription: true,
  address: true,
} as const;

/** Use under `room:` on Booking or ServiceRequest. */
export const prismaRoomWithResort = {
  include: {
    resort: { select: resortSelect },
  },
} as const;

/** Nested booking on ServiceRequest — room + resort only. */
export const prismaBookingWithRoomResort = {
  room: prismaRoomWithResort,
} as const;

/** Booking list / create: room, resort, and service-request count. */
export const bookingListInclude = {
  room: prismaRoomWithResort,
  _count: {
    select: { serviceRequests: true },
  },
} as const;

/** Booking detail: above plus service request timeline. */
export const bookingDetailInclude = {
  room: prismaRoomWithResort,
  _count: {
    select: { serviceRequests: true },
  },
  serviceRequests: {
    orderBy: { createdAt: "desc" as const },
    select: {
      id: true,
      message: true,
      status: true,
      serviceCategory: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} as const;

export function buildStaySummary(b: {
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  room?: { pricePerNight: number } | null;
}): { nights: number; pricePerNight: number; totalPrice: number } {
  const nights = nightCount(b.checkIn, b.checkOut);
  const pricePerNight =
    nights > 0 ? Math.round(b.totalPrice / nights) : (b.room?.pricePerNight ?? 0);
  return { nights, pricePerNight, totalPrice: b.totalPrice };
}
