import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Booking, UserRole } from '@/types';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface BookingCardProps {
  booking: Booking;
  userRole: UserRole;
  onCancel?: () => void;
  onComplete?: () => void;
  onReview?: () => void;
}

export function BookingCard({ booking, userRole, onCancel, onComplete, onReview }: BookingCardProps) {
  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = () => {
    switch (booking.status) {
      case 'active':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
      case 'completed':
        return Colors.info;
      default:
        return Colors.textMuted;
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {booking.parking?.title || 'Parking Space'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {booking.status}
          </Text>
        </View>
      </View>

      {userRole === 'owner' && booking.driver && (
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={16} color={Colors.textMuted} />
          <Text style={styles.infoText}>Driver: {booking.driver.name}</Text>
        </View>
      )}

      <View style={styles.infoRow}>
        <MaterialIcons name="location-on" size={16} color={Colors.textMuted} />
        <Text style={styles.address} numberOfLines={1}>
          {booking.parking?.address || 'Address not available'}
        </Text>
      </View>

      <View style={styles.timeContainer}>
        <View style={styles.timeRow}>
          <MaterialIcons name="schedule" size={16} color={Colors.primary} />
          <Text style={styles.timeLabel}>Start:</Text>
          <Text style={styles.timeValue}>
            {formatDate(startDate)} {formatTime(startDate)}
          </Text>
        </View>
        <View style={styles.timeRow}>
          <MaterialIcons name="schedule" size={16} color={Colors.primary} />
          <Text style={styles.timeLabel}>End:</Text>
          <Text style={styles.timeValue}>
            {formatDate(endDate)} {formatTime(endDate)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.price}>₹{booking.totalPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.actions}>
          {onReview && booking.status === 'completed' && (
            <Button
              title="Review"
              onPress={onReview}
              variant="primary"
              size="small"
              icon={<MaterialIcons name="star" size={16} color={Colors.text} />}
            />
          )}
          {onComplete && booking.status === 'active' && (
            <Button
              title="Complete"
              onPress={onComplete}
              variant="primary"
              size="small"
            />
          )}
          {onCancel && booking.status === 'active' && (
            <Button
              title="Cancel"
              onPress={onCancel}
              variant="outline"
              size="small"
            />
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    flex: 1,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    textTransform: 'capitalize',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  address: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  timeContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timeLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  timeValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  price: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
