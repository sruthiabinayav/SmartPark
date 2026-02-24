import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useParking } from '@/hooks/useParking';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { BookingCard } from '@/components/feature/BookingCard';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlert } from '@/template';

export default function BookingsScreen() {
  const { user } = useAuth();
  const { bookings, updateBooking } = useParking();
  const { showAlert } = useAlert();

  const isDriver = user?.role === 'driver';
  const myBookings = isDriver
    ? bookings.filter(b => b.driverId === user?.id)
    : bookings.filter(b => 
        b.parkingSpace && bookings.find(booking => booking.parkingSpace?.ownerId === user?.id)
      );

  const activeBookings = myBookings.filter(
    b => b.status === 'confirmed' || b.status === 'pending'
  );
  const pastBookings = myBookings.filter(
    b => b.status === 'completed' || b.status === 'cancelled'
  );

  async function handleCancelBooking(bookingId: string) {
    showAlert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const booking = bookings.find(b => b.id === bookingId);
            if (booking) {
              await updateBooking({ ...booking, status: 'cancelled' });
              showAlert('Success', 'Booking cancelled successfully');
            }
          },
        },
      ]
    );
  }

  return (
    <Screen scroll edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>{isDriver ? 'My Bookings' : 'Booking Requests'}</Text>

        {activeBookings.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Active Bookings</Text>
            {activeBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={() => handleCancelBooking(booking.id)}
                showActions={isDriver}
              />
            ))}
          </>
        )}

        {pastBookings.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Past Bookings</Text>
            {pastBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                showActions={false}
              />
            ))}
          </>
        )}

        {myBookings.length === 0 && (
          <Card style={styles.emptyCard}>
            <MaterialIcons name="event-busy" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubtext}>
              {isDriver
                ? 'Book a parking space to see it here'
                : 'Bookings will appear here when drivers book your spaces'}
            </Text>
          </Card>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xxl,
    marginTop: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
