import { createContext, useState, useEffect, ReactNode } from 'react';
import { ParkingSpace, Booking } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchParkingSpaces,
  createParkingSpace as dbCreateParkingSpace,
  updateParkingSpace as dbUpdateParkingSpace,
  deleteParkingSpace as dbDeleteParkingSpace,
  fetchUserBookings,
  createBooking as dbCreateBooking,
  updateBookingStatus as dbUpdateBookingStatus,
  subscribeToParkingUpdates,
  subscribeToBookingUpdates,
} from '@/services/database';
import { scheduleBookingReminder, scheduleLocalNotification } from '@/services/notifications';

interface ParkingContextType {
  parkingSpaces: ParkingSpace[];
  bookings: Booking[];
  loading: boolean;
  refreshParkingSpaces: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  addParkingSpace: (parking: Omit<ParkingSpace, 'id' | 'createdAt'>) => Promise<void>;
  updateParkingSpace: (id: string, updates: Partial<ParkingSpace>) => Promise<void>;
  removeParkingSpace: (id: string) => Promise<void>;
  createBooking: (booking: {
    parkingId: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
  }) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  completeBooking: (bookingId: string) => Promise<void>;
}

export const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export function ParkingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
      const cleanup = setupSubscriptions();
      return cleanup;
    } else {
      setParkingSpaces([]);
      setBookings([]);
      setLoading(false);
    }
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      await Promise.all([refreshParkingSpaces(), refreshBookings()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function setupSubscriptions() {
    if (!user) return () => {};

    const parkingChannel = subscribeToParkingUpdates((payload) => {
      console.log('Parking update:', payload);
      refreshParkingSpaces();
    });

    const bookingChannel = subscribeToBookingUpdates(user.id, (payload) => {
      console.log('Booking update:', payload);
      refreshBookings();
    });

    return () => {
      parkingChannel.unsubscribe();
      bookingChannel.unsubscribe();
    };
  }

  async function refreshParkingSpaces() {
    try {
      const spaces = await fetchParkingSpaces();
      setParkingSpaces(spaces.map(convertFromDb));
    } catch (error) {
      console.error('Error fetching parking spaces:', error);
    }
  }

  async function refreshBookings() {
    if (!user) return;
    
    try {
      const userBookings = await fetchUserBookings(user.id, user.role);
      setBookings(userBookings.map(convertBookingFromDb));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  }

  async function addParkingSpace(parking: Omit<ParkingSpace, 'id' | 'createdAt'>) {
    try {
      const result = await dbCreateParkingSpace(parking);
      await refreshParkingSpaces();
      
      await scheduleLocalNotification(
        'Parking Space Created',
        `Your parking space "${parking.title}" is now live!`,
        { type: 'parking_created' }
      );
      
      return result;
    } catch (error: any) {
      console.error('Error in addParkingSpace:', error);
      throw new Error(error.message || 'Failed to create parking space');
    }
  }

  async function updateParkingSpace(id: string, updates: Partial<ParkingSpace>) {
    try {
      await dbUpdateParkingSpace(id, updates);
      await refreshParkingSpaces();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update parking space');
    }
  }

  async function removeParkingSpace(id: string) {
    try {
      await dbDeleteParkingSpace(id);
      await refreshParkingSpaces();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete parking space');
    }
  }

  async function createBooking(booking: {
    parkingId: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
  }) {
    if (!user) throw new Error('User not authenticated');

    try {
      const newBooking = await dbCreateBooking({
        ...booking,
        driverId: user.id,
      });

      await refreshBookings();
      
      const parking = parkingSpaces.find(p => p.id === booking.parkingId);
      if (parking) {
        await scheduleBookingReminder(
          newBooking.id,
          parking.title,
          new Date(booking.startTime)
        );
      }

      await scheduleLocalNotification(
        'Booking Confirmed!',
        `Your booking at ${parking?.title || 'parking space'} is confirmed`,
        { bookingId: newBooking.id, type: 'booking_confirmed' }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create booking');
    }
  }

  async function cancelBooking(bookingId: string) {
    try {
      await dbUpdateBookingStatus(bookingId, 'cancelled');
      await refreshBookings();
      
      await scheduleLocalNotification(
        'Booking Cancelled',
        'Your booking has been cancelled',
        { bookingId, type: 'booking_cancelled' }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to cancel booking');
    }
  }

  async function completeBooking(bookingId: string) {
    try {
      await dbUpdateBookingStatus(bookingId, 'completed');
      await refreshBookings();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to complete booking');
    }
  }

  return (
    <ParkingContext.Provider
      value={{
        parkingSpaces,
        bookings,
        loading,
        refreshParkingSpaces,
        refreshBookings,
        addParkingSpace,
        updateParkingSpace,
        removeParkingSpace,
        createBooking,
        cancelBooking,
        completeBooking,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
}

function convertFromDb(space: any): ParkingSpace {
  return {
    id: space.id,
    ownerId: space.owner_id,
    title: space.title,
    description: space.description || '',
    address: space.address,
    latitude: space.latitude,
    longitude: space.longitude,
    pricePerHour: parseFloat(space.price_per_hour),
    available: space.available,
    parkingType: space.parking_type,
    spaceType: space.space_type,
    features: space.features || [],
    rating: space.average_rating ? parseFloat(space.average_rating) : undefined,
    totalBookings: space.total_bookings || 0,
    createdAt: space.created_at,
  };
}

function convertBookingFromDb(booking: any): Booking {
  return {
    id: booking.id,
    parkingId: booking.parking_id,
    driverId: booking.driver_id,
    startTime: booking.start_time,
    endTime: booking.end_time,
    totalPrice: parseFloat(booking.total_price),
    status: booking.status,
    createdAt: booking.created_at,
    parking: booking.parking ? convertFromDb(booking.parking) : undefined,
    driver: booking.driver ? {
      id: booking.driver.id,
      email: booking.driver.email,
      name: booking.driver.name || booking.driver.username,
      username: booking.driver.username,
      role: 'driver',
      createdAt: booking.driver.created_at,
    } : undefined,
  };
}
