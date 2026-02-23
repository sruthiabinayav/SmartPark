import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useParking } from '@/hooks/useParking';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function ParkingDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { parkingSpaces } = useParking();

  const parking = parkingSpaces.find(s => s.id === id);

  if (!parking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Parking space not found</Text>
      </View>
    );
  }

  const isDriver = user?.role === 'driver';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <MaterialIcons name="local-parking" size={80} color={Colors.primary} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{parking.title}</Text>
            <View style={styles.rating}>
              <MaterialIcons name="star" size={20} color={Colors.primary} />
              <Text style={styles.ratingText}>
                {parking.rating?.toFixed(1) || 'New'} · {parking.totalBookings || 0} bookings
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, !parking.available && styles.unavailableBadge]}>
            <Text style={[styles.statusText, !parking.available && styles.unavailableText]}>
              {parking.available ? 'Available' : 'Occupied'}
            </Text>
          </View>
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.price}>${parking.pricePerHour}</Text>
          <Text style={styles.priceUnit}>/hour</Text>
        </View>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <Text style={styles.address}>{parking.address}</Text>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="description" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Description</Text>
          </View>
          <Text style={styles.description}>{parking.description}</Text>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="local-offer" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Features</Text>
          </View>
          <View style={styles.features}>
            {parking.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={20} color={Colors.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </Card>

        {isDriver && parking.available && (
          <Button
            title="Book Now"
            onPress={() =>
              router.push({
                pathname: '/booking-confirm',
                params: { parkingId: parking.id },
              })
            }
            fullWidth
            size="large"
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: Typography.sizes.lg,
    color: Colors.textMuted,
  },
  imageContainer: {
    width: '100%',
    height: 250,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
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
  priceCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '20',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  price: {
    fontSize: 48,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  address: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  description: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  features: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureText: {
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
});
