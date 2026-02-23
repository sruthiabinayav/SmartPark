import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, ParkingSpace, Booking } from '@/types';

const KEYS = {
  USER: '@smartpark_user',
  PARKING_SPACES: '@smartpark_parking_spaces',
  BOOKINGS: '@smartpark_bookings',
};

// User storage
export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export async function getUser(): Promise<User | null> {
  const data = await AsyncStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER);
}

// Parking spaces storage
export async function saveParkingSpaces(spaces: ParkingSpace[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.PARKING_SPACES, JSON.stringify(spaces));
}

export async function getParkingSpaces(): Promise<ParkingSpace[]> {
  const data = await AsyncStorage.getItem(KEYS.PARKING_SPACES);
  return data ? JSON.parse(data) : [];
}

export async function addParkingSpace(space: ParkingSpace): Promise<void> {
  const spaces = await getParkingSpaces();
  spaces.push(space);
  await saveParkingSpaces(spaces);
}

export async function updateParkingSpace(updatedSpace: ParkingSpace): Promise<void> {
  const spaces = await getParkingSpaces();
  const index = spaces.findIndex(s => s.id === updatedSpace.id);
  if (index !== -1) {
    spaces[index] = updatedSpace;
    await saveParkingSpaces(spaces);
  }
}

export async function deleteParkingSpace(spaceId: string): Promise<void> {
  const spaces = await getParkingSpaces();
  const filtered = spaces.filter(s => s.id !== spaceId);
  await saveParkingSpaces(filtered);
}

// Bookings storage
export async function saveBookings(bookings: Booking[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
}

export async function getBookings(): Promise<Booking[]> {
  const data = await AsyncStorage.getItem(KEYS.BOOKINGS);
  return data ? JSON.parse(data) : [];
}

export async function addBooking(booking: Booking): Promise<void> {
  const bookings = await getBookings();
  bookings.push(booking);
  await saveBookings(bookings);
}

export async function updateBooking(updatedBooking: Booking): Promise<void> {
  const bookings = await getBookings();
  const index = bookings.findIndex(b => b.id === updatedBooking.id);
  if (index !== -1) {
    bookings[index] = updatedBooking;
    await saveBookings(bookings);
  }
}
