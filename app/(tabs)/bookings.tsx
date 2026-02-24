import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useParking } from '@/hooks/useParking';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookingCard } from '@/components/feature/BookingCard';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Booking } from '@/types';
import { useAlert } from '@/template';

export default function BookingsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { bookings, loading, cancelBooking, completeBooking } = useParking();
  const { showAlert } = useAlert();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const isDriver = user?.role === 'driver';

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'active') return booking.status === 'active';
    if (filter === 'completed') return booking.status === 'completed';
    return true;
  });

  async function handleCancelBooking(bookingId: string) {
    showAlert(t('cancelBooking'), t('confirmCancel'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelBooking(bookingId);
            showAlert(t('success'), t('bookingCancelled'));
          } catch (error: any) {
            showAlert(t('error'), error.message);
          }
        },
      },
    ]);
  }

  async function handleCompleteBooking(bookingId: string) {
    try {
      await completeBooking(bookingId);
      showAlert(t('success'), 'Booking marked as completed');
    } catch (error: any) {
      showAlert(t('error'), error.message);
    }
  }

  function handleReviewBooking(booking: Booking) {
    router.push({
      pathname: '/review',
      params: {
        bookingId: booking.id,
        parkingId: booking.parkingId,
        parkingTitle: booking.parking?.title || 'Parking',
      },
    });
  }

  if (loading) {
    return (
      <Screen edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>{isDriver ? t('myBookings') : t('bookingRequests')}</Text>

        <View style={styles.filterBar}>
          {(['all', 'active', 'completed'] as const).map(f => (
            <Pressable
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? t('all') : f === 'active' ? t('activeBookings') : t('pastBookings')}
              </Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={filteredBookings}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              userRole={user?.role || 'driver'}
              onCancel={item.status === 'active' ? () => handleCancelBooking(item.id) : undefined}
              onComplete={
                !isDriver && item.status === 'active'
                  ? () => handleCompleteBooking(item.id)
                  : undefined
              }
              onReview={
                isDriver && item.status === 'completed'
                  ? () => handleReviewBooking(item)
                  : undefined
              }
            />
          )}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <MaterialIcons name="event-busy" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>
                {isDriver ? t('noBookingsYet') : t('bookingsWillAppear')}
              </Text>
              {isDriver && (
                <>
                  <Text style={styles.emptySubtext}>{t('bookParkingToSee')}</Text>
                  <Button
                    title={t('explore')}
                    onPress={() => router.push('/(tabs)')}
                    style={styles.exploreButton}
                  />
                </>
              )}
            </Card>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
  },
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  filterBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
  },
  filterTextActive: {
    color: Colors.text,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xxl,
    marginTop: Spacing.xxl,
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  exploreButton: {
    marginTop: Spacing.lg,
  },
});
