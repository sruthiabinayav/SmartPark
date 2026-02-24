export type UserRole = 'driver' | 'owner';
export type ParkingType = 'car' | 'bike' | 'both';
export type SpaceType = 'house' | 'apartment' | 'public' | 'commercial';
export type BookingStatus = 'active' | 'completed' | 'cancelled';
export type NotificationType = 'booking' | 'payment' | 'availability' | 'review' | 'general';

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface ParkingSpace {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  pricePerHour: number;
  available: boolean;
  parkingType: ParkingType;
  spaceType: SpaceType;
  features: string[];
  images?: string[];
  rating?: number;
  averageRating?: number;
  totalBookings?: number;
  createdAt: string;
  owner?: User;
}

export interface Booking {
  id: string;
  parkingId: string;
  driverId: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  parking?: ParkingSpace;
  driver?: User;
}

export interface Review {
  id: string;
  parkingId: string;
  driverId: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: string;
  driver?: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data: any;
  read: boolean;
  createdAt: string;
}

export interface ParkingRecommendation {
  parking: ParkingSpace;
  distance: number;
  score: number;
  reason: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
