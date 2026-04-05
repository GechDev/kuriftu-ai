export type UserRole = "GUEST" | "MANAGER" | "ADMIN";

export type User = {
  id: string;
  email: string;
  isAdmin: boolean;
  role: UserRole;
  createdAt?: string;
};

export type ResortSummary = {
  id: string;
  name: string;
  slug: string;
  region: string;
  shortDescription: string;
  /** Present when loaded from booking/service APIs. */
  address?: string;
};

export type Resort = ResortSummary & {
  address: string;
  fullDescription: string | null;
  mapOverview: string;
  createdAt: string;
  updatedAt: string;
  _count?: { services: number; mapPlaces: number; rooms: number };
};

export type ResortListItem = ResortSummary & {
  address: string;
  _count: { services: number; mapPlaces: number; rooms: number };
};

export type ResortServiceItem = {
  id: string;
  resortId: string;
  category: string;
  title: string;
  description: string;
  hours: string | null;
  locationNote: string | null;
  howToBook: string | null;
};

export type MapPlaceItem = {
  id: string;
  resortId: string;
  name: string;
  category: string;
  building: string | null;
  floor: string | null;
  directionsFromLobby: string;
};

export type Room = {
  id: string;
  name: string;
  description: string | null;
  pricePerNight: number;
  createdAt?: string;
  resort?: ResortSummary | null;
};

export type ServiceRequestStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type StaySummary = {
  nights: number;
  pricePerNight: number;
  totalPrice: number;
};

/** Service-request rows returned on booking detail. */
export type BookingRequestLine = {
  id: string;
  message: string;
  status: ServiceRequestStatus;
  serviceCategory: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Booking = {
  id: string;
  userId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  createdAt: string;
  room?: Room;
  user?: { id: string; email: string };
  _count?: { serviceRequests: number };
  serviceRequests?: BookingRequestLine[];
  /** Attached when booking is embedded (e.g. on a service request). */
  staySummary?: StaySummary;
};

/** List/create API payloads attach a computed stay breakdown. */
export type BookingWithSummary = Booking & { staySummary: StaySummary };

export type ServiceRequest = {
  id: string;
  userId: string;
  roomId: string;
  bookingId: string | null;
  message: string;
  serviceCategory?: string | null;
  status: ServiceRequestStatus;
  createdAt: string;
  updatedAt: string;
  room?: Room;
  booking?: Booking | null;
  user?: { id: string; email: string };
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type AvailabilityDay = { date: string; booked: boolean };
