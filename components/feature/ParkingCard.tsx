import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { ParkingSpace } from '@/types';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';

interface ParkingCardProps {
  parking: ParkingSpace;
  distance?: number;
  onPress: () => void;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ParkingCard({
  parking,
  distance,
  onPress,
  showActions = false,
  onEdit,
  onDelete,
}: ParkingCardProps) {
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title} numberOfLines={1}>
            {parking.title}
          </Text>
          <View style={styles.rating}>
            <MaterialIcons name="star" size={16} color={Colors.primary} />
            <Text style={styles.ratingText}>{parking.rating?.toFixed(1) || 'New'}</Text>
            {distance !== undefined && (
              <Text style={styles.distance}> · {distance.toFixed(1)} km</Text>
            )}
          </View>
        </View>
        {showActions && (
          <View style={styles.actions}>
            <Pressable onPress={onEdit} hitSlop={8}>
              <MaterialIcons name="edit" size={20} color={Colors.textSecondary} />
            </Pressable>
            <Pressable onPress={onDelete} hitSlop={8}>
              <MaterialIcons name="delete" size={20} color={Colors.error} />
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.addressRow}>
        <Ionicons name="location-outline" size={16} color={Colors.textMuted} />
        <Text style={styles.address} numberOfLines={1}>
          {parking.address}
        </Text>
      </View>

      <View style={styles.features}>
        {parking.features.slice(0, 3).map((feature, index) => (
          <View key={index} style={styles.featureTag}>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{parking.pricePerHour}</Text>
          <Text style={styles.priceUnit}>/hour</Text>
        </View>
        <View style={[styles.statusBadge, !parking.available && styles.unavailableBadge]}>
          <Text style={[styles.statusText, !parking.available && styles.unavailableText]}>
            {parking.available ? 'Available' : 'Occupied'}
          </Text>
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
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  distance: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  address: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  featureTag: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  featureText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  statusBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  unavailableBadge: {
    backgroundColor: Colors.textMuted + '20',
  },
  statusText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.success,
  },
  unavailableText: {
    color: Colors.textMuted,
  },
});
