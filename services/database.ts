import { getSupabaseClient } from '@/template';
import { ParkingSpace, Booking, Review, Notification } from '@/types';

const supabase = getSupabaseClient();

// ==================== PARKING SPACES ====================

export async function fetchParkingSpaces() {
  const { data, error } = await supabase
    .from('parking_spaces')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ParkingSpace[];
}

export async function fetchParkingSpaceById(id: string) {
  const { data, error } = await supabase
    .from('parking_spaces')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as ParkingSpace;
}

export async function createParkingSpace(parking: Omit<ParkingSpace, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabase
    .from('parking_spaces')
    .insert({
      owner_id: parking.ownerId,
      title: parking.title,
      description: parking.description,
      address: parking.address,
      latitude: parking.latitude,
      longitude: parking.longitude,
      price_per_hour: parking.pricePerHour,
      parking_type: parking.parkingType,
      space_type: parking.spaceType,
      features: parking.features,
      available: parking.available,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateParkingSpace(id: string, updates: Partial<ParkingSpace>) {
  const updateData: any = {};
  
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.address !== undefined) updateData.address = updates.address;
  if (updates.pricePerHour !== undefined) updateData.price_per_hour = updates.pricePerHour;
  if (updates.available !== undefined) updateData.available = updates.available;
  if (updates.features !== undefined) updateData.features = updates.features;

  const { data, error } = await supabase
    .from('parking_spaces')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteParkingSpace(id: string) {
  const { error } = await supabase
    .from('parking_spaces')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ==================== BOOKINGS ====================

export async function fetchUserBookings(userId: string, userRole: 'driver' | 'owner') {
  let query = supabase
    .from('bookings')
    .select(`
      *,
      parking:parking_spaces(*),
      driver:user_profiles!bookings_driver_id_fkey(*)
    `);

  if (userRole === 'driver') {
    query = query.eq('driver_id', userId);
  } else {
    query = query.in('parking_id', 
      supabase.from('parking_spaces').select('id').eq('owner_id', userId)
    );
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data as Booking[];
}

export async function createBooking(booking: {
  parkingId: string;
  driverId: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
}) {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      parking_id: booking.parkingId,
      driver_id: booking.driverId,
      start_time: booking.startTime,
      end_time: booking.endTime,
      total_price: booking.totalPrice,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBookingStatus(bookingId: string, status: 'active' | 'completed' | 'cancelled') {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==================== REVIEWS ====================

export async function fetchParkingReviews(parkingId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      driver:user_profiles(name, username)
    `)
    .eq('parking_id', parkingId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Review[];
}

export async function createReview(review: {
  parkingId: string;
  driverId: string;
  bookingId: string;
  rating: number;
  comment: string;
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      parking_id: review.parkingId,
      driver_id: review.driverId,
      booking_id: review.bookingId,
      rating: review.rating,
      comment: review.comment,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function checkCanReview(driverId: string, bookingId: string) {
  // Check if booking exists and is completed
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('driver_id', driverId)
    .eq('status', 'completed')
    .single();

  if (bookingError || !booking) return false;

  // Check if review already exists
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', bookingId)
    .single();

  return !review; // Can review if no review exists
}

// ==================== NOTIFICATIONS ====================

export async function fetchUserNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data as Notification[];
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId);

  if (error) throw error;
}

export async function deleteNotification(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) throw error;
}

// ==================== REALTIME SUBSCRIPTIONS ====================

export function subscribeToParkingUpdates(callback: (payload: any) => void) {
  return supabase
    .channel('parking_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_spaces' }, callback)
    .subscribe();
}

export function subscribeToBookingUpdates(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('booking_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, callback)
    .subscribe();
}

export function subscribeToNotifications(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      callback
    )
    .subscribe();
}
