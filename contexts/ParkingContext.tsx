import { createContext, useState, useEffect, ReactNode } from 'react';
import { ParkingSpace, Booking } from '@/types';
import {
  getParkingSpaces,
  saveParkingSpaces,
  addParkingSpace as addParkingSpaceStorage,
  updateParkingSpace as updateParkingSpaceStorage,
  deleteParkingSpace as deleteParkingSpaceStorage,
  getBookings,
  addBooking as addBookingStorage,
  updateBooking as updateBookingStorage,
} from '@/services/storage';
import { MOCK_PARKING_SPACES } from '@/services/mockData';

interface ParkingContextType {
  parkingSpaces: ParkingSpace[];
  bookings: Booking[];
  loading: boolean;
  addParkingSpace: (space: ParkingSpace) => Promise<void>;
  updateParkingSpace: (space: ParkingSpace) => Promise<void>;
  deleteParkingSpace: (spaceId: string) => Promise<void>;
  addBooking: (booking: Booking) => Promise<void>;
  updateBooking: (booking: Booking) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export function ParkingProvider({ children }: { children: ReactNode }) {
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      let spaces = await getParkingSpaces();
      
      // Initialize with mock data if empty
      if (spaces.length === 0) {
        spaces = MOCK_PARKING_SPACES;
        await saveParkingSpaces(spaces);
      }
      
      const loadedBookings = await getBookings();
      
      // Populate parking space details in bookings
      const enrichedBookings = loadedBookings.map(booking => ({
        ...booking,
        parkingSpace: spaces.find(s => s.id === booking.parkingSpaceId),
      }));
      
      setParkingSpaces(spaces);
      setBookings(enrichedBookings);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addParkingSpace(space: ParkingSpace) {
    await addParkingSpaceStorage(space);
    setParkingSpaces(prev => [...prev, space]);
  }

  async function updateParkingSpace(space: ParkingSpace) {
    await updateParkingSpaceStorage(space);
    setParkingSpaces(prev => prev.map(s => (s.id === space.id ? space : s)));
  }

  async function deleteParkingSpace(spaceId: string) {
    await deleteParkingSpaceStorage(spaceId);
    setParkingSpaces(prev => prev.filter(s => s.id !== spaceId));
  }

  async function addBooking(booking: Booking) {
    const parkingSpace = parkingSpaces.find(s => s.id === booking.parkingSpaceId);
    const enrichedBooking = { ...booking, parkingSpace };
    
    await addBookingStorage(booking);
    setBookings(prev => [...prev, enrichedBooking]);
  }

  async function updateBooking(booking: Booking) {
    const parkingSpace = parkingSpaces.find(s => s.id === booking.parkingSpaceId);
    const enrichedBooking = { ...booking, parkingSpace };
    
    await updateBookingStorage(booking);
    setBookings(prev => prev.map(b => (b.id === booking.id ? enrichedBooking : b)));
  }

  async function refreshData() {
    await loadData();
  }

  return (
    <ParkingContext.Provider
      value={{
        parkingSpaces,
        bookings,
        loading,
        addParkingSpace,
        updateParkingSpace,
        deleteParkingSpace,
        addBooking,
        updateBooking,
        refreshData,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
}
