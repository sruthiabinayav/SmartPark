export type UserRole = 'driver' | 'owner';
export type ParkingType = 'car' | 'bike' | 'both';
export type SpaceType = 'house' | 'apartment' | 'public' | 'commercial';

export interface User {
  id: string;
  email: string;
  name: string;
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
  totalBookings?: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  parkingSpaceId: string;
  driverId: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  parkingSpace?: ParkingSpace;
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
