import { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useParking } from '@/hooks/useParking';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Booking } from '@/types';
import { useAlert } from '@/template';

export default function BookingConfirmScreen() {
  const router = useRouter();
  const { parkingId } = useLocalSearchParams();
  const { user } = useAuth();
  const { parkingSpaces, addBooking } = useParking();
  const { showAlert } = useAlert();

  const parking = parkingSpaces.find(s => s.id === parkingId);
  
  const [startTime, setStartTime] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [endTime, setEndTime] = useState(new Date(Date.now() + 4 * 60 * 60 * 1000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!parking) {
    return (
      <Screen edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Parking space not found</Text>
        </View>
      </Screen>
    );
  }

  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  const totalPrice = duration * parking.pricePerHour;

  async function handleConfirmBooking() {
    if (endTime <= startTime) {
      showAlert('Invalid Time', 'End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      const booking: Booking = {
        id: `booking_${Date.now()}`,
        parkingSpaceId: parking.id,
        driverId: user!.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalPrice,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };

      await addBooking(booking);
      showAlert('Success', 'Booking confirmed successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/bookings'),
        },
      ]);
    } catch (error) {
      showAlert('Error', 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll edges={['top']}>
      <View style={styles.container}>
        <Card style={styles.parkingCard}>
          <Text style={styles.parkingTitle}>{parking.title}</Text>
          <Text style={styles.parkingAddress}>{parking.address}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.hourlyRate}>${parking.pricePerHour}/hour</Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Select Date & Time</Text>

        <Card style={styles.timeCard}>
          <View style={styles.timeRow}>
            <MaterialIcons name="schedule" size={24} color={Colors.primary} />
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Start Time</Text>
              <Text style={styles.timeValue} onPress={() => setShowStartPicker(true)}>
                {startTime.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.timeCard}>
          <View style={styles.timeRow}>
            <MaterialIcons name="schedule" size={24} color={Colors.primary} />
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>End Time</Text>
              <Text style={styles.timeValue} onPress={() => setShowEndPicker(true)}>
                {endTime.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        </Card>

        {showStartPicker && (
          <DateTimePicker
            value={startTime}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (selectedDate) setStartTime(selectedDate);
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endTime}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowEndPicker(Platform.OS === 'ios');
              if (selectedDate) setEndTime(selectedDate);
            }}
          />
        )}

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{duration.toFixed(1)} hours</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rate</Text>
            <Text style={styles.summaryValue}>${parking.pricePerHour}/hour</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
          </View>
        </Card>

        <Button
          title={loading ? 'Confirming...' : 'Confirm Booking'}
          onPress={handleConfirmBooking}
          disabled={loading}
          fullWidth
          size="large"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Typography.sizes.lg,
    color: Colors.textMuted,
  },
  parkingCard: {
    marginBottom: Spacing.xl,
  },
  parkingTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  parkingAddress: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hourlyRate: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  timeCard: {
    marginBottom: Spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  summaryCard: {
    marginVertical: Spacing.xl,
  },
  summaryTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  totalValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
});
