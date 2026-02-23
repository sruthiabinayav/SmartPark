import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useParking } from '@/hooks/useParking';
import { useLanguage } from '@/hooks/useLanguage';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ParkingCard } from '@/components/feature/ParkingCard';
import { ParkingMap } from '@/components/feature/ParkingMap';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { ParkingSpace, ParkingRecommendation } from '@/types';
import {
  recommendParkingSpaces,
  getRecommendationsByType,
  calculateDistance,
} from '@/services/aiAllocation';
import { useAlert } from '@/template';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { parkingSpaces, loading: parkingLoading } = useParking();
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [recommendations, setRecommendations] = useState<ParkingRecommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'nearest' | 'cheapest' | 'popular'>('all');

  const isDriver = user?.role === 'driver';
  const mySpaces = parkingSpaces.filter(s => s.ownerId === user?.id);

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (location && isDriver) {
      updateRecommendations();
    }
  }, [location, parkingSpaces, selectedCategory]);

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      showAlert(t('error'), 'Location permission is required');
      setLocation({
        coords: {
          latitude: 13.0827,
          longitude: 80.2707,
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  }

  function updateRecommendations() {
    if (!location) return;

    const { latitude, longitude } = location.coords;

    if (selectedCategory === 'all') {
      const recs = recommendParkingSpaces(parkingSpaces, latitude, longitude, 10);
      setRecommendations(recs);
    } else {
      const spaces = getRecommendationsByType(parkingSpaces, latitude, longitude, selectedCategory);
      const recs = spaces.map(space => ({
        parking: space,
        distance: calculateDistance(latitude, longitude, space.latitude, space.longitude),
        score: 0,
        reason: selectedCategory === 'nearest' ? t('nearest') : selectedCategory === 'cheapest' ? t('cheapest') : t('popular'),
      }));
      setRecommendations(recs);
    }
  }

  function renderDriverView() {
    return (
      <>
        <View style={styles.mapContainer}>
          <ParkingMap
            userLatitude={location?.coords.latitude || 13.0827}
            userLongitude={location?.coords.longitude || 80.2707}
            parkingSpaces={parkingSpaces}
            onMarkerPress={(spaceId) =>
              router.push({
                pathname: '/parking-details',
                params: { id: spaceId },
              })
            }
          />
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>{t('aiRecommendations')}</Text>
            <Pressable
              style={styles.aiButton}
              onPress={() => router.push('/ai-assistant')}
            >
              <MaterialIcons name="smart-toy" size={24} color={Colors.primary} />
            </Pressable>
          </View>
          
          <View style={styles.categoryBar}>
            {(['all', 'nearest', 'cheapest', 'popular'] as const).map(cat => (
              <Card
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat === 'all' ? t('smartPick') : t(cat)}
                </Text>
              </Card>
            ))}
          </View>

          <FlatList
            data={recommendations}
            keyExtractor={item => item.parking.id}
            renderItem={({ item }) => (
              <View style={styles.recommendationCard}>
                <View style={styles.recommendationBadge}>
                  <MaterialIcons name="auto-awesome" size={14} color={Colors.primary} />
                  <Text style={styles.recommendationReason}>{item.reason}</Text>
                </View>
                <ParkingCard
                  parking={item.parking}
                  distance={item.distance}
                  onPress={() =>
                    router.push({
                      pathname: '/parking-details',
                      params: { id: item.parking.id },
                    })
                  }
                />
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>{t('noParkingAvailable')}</Text>
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      </>
    );
  }

  function renderOwnerView() {
    const totalEarnings = mySpaces.reduce(
      (sum, space) => sum + (space.totalBookings || 0) * space.pricePerHour,
      0
    );
    const availableCount = mySpaces.filter(s => s.available).length;

    return (
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.welcomeText}>{t('welcome')}, {user?.name}!</Text>
          <Pressable
            style={styles.aiButton}
            onPress={() => router.push('/ai-assistant')}
          >
            <MaterialIcons name="smart-toy" size={24} color={Colors.primary} />
          </Pressable>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <MaterialIcons name="local-parking" size={32} color={Colors.primary} />
            <Text style={styles.statValue}>{mySpaces.length}</Text>
            <Text style={styles.statLabel}>{t('totalSpaces')}</Text>
          </Card>

          <Card style={styles.statCard}>
            <MaterialIcons name="check-circle" size={32} color={Colors.success} />
            <Text style={styles.statValue}>{availableCount}</Text>
            <Text style={styles.statLabel}>{t('available')}</Text>
          </Card>

          <Card style={styles.statCard}>
            <MaterialIcons name="currency-rupee" size={32} color={Colors.primary} />
            <Text style={styles.statValue}>₹{totalEarnings.toFixed(0)}</Text>
            <Text style={styles.statLabel}>{t('totalRevenue')}</Text>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('myParkingSpaces')}</Text>
          <Button
            title={t('addParking')}
            onPress={() => router.push('/add-parking')}
            size="small"
            icon={<MaterialIcons name="add" size={20} color={Colors.text} />}
          />
        </View>

        <FlatList
          data={mySpaces}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ParkingCard
              parking={item}
              onPress={() =>
                router.push({
                  pathname: '/parking-details',
                  params: { id: item.id },
                })
              }
              showActions
              onEdit={() => showAlert(t('comingSoon'), 'Edit functionality will be available soon')}
              onDelete={() =>
                showAlert(t('delete'), 'Are you sure you want to delete this parking space?')
              }
            />
          )}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <MaterialIcons name="add-circle-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>{t('noParkingYet')}</Text>
              <Text style={styles.emptySubtext}>{t('addFirstParking')}</Text>
              <Button
                title={t('addParking')}
                onPress={() => router.push('/add-parking')}
                style={styles.addButton}
              />
            </Card>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  if (parkingLoading) {
    return (
      <Screen edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </Screen>
    );
  }

  return <Screen edges={['top']}>{isDriver ? renderDriverView() : renderOwnerView()}</Screen>;
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
  mapContainer: {
    height: height * 0.4,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  welcomeText: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  aiButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  statValue: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  categoryBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
  },
  categoryTextActive: {
    color: Colors.text,
  },
  recommendationCard: {
    marginBottom: Spacing.md,
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  recommendationReason: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.primary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xxl,
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
  addButton: {
    marginTop: Spacing.lg,
  },
});
