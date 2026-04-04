export type User = {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt?: string;
};

export type Room = {
  id: string;
  name: string;
  description: string | null;
  pricePerNight: number;
  createdAt?: string;
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
};

export type ServiceRequestStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type ServiceRequest = {
  id: string;
  userId: string;
  roomId: string;
  bookingId: string | null;
  message: string;
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
