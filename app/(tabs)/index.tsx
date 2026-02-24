import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useParking } from '@/hooks/useParking';
import { useLanguage } from '@/hooks/useLanguage';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
    const totalBookings = 6;
    const activeBookings = 1;
    const totalSpent = 645;
    const availableSpaces = parkingSpaces.filter(s => s.available).length;
    const totalSpaces = parkingSpaces.length;

    const bestOverall = recommendations[0];
    const bestValue = recommendations.find(r => r.parking.pricePerHour <= 20) || recommendations[1];
    const mostPopular = recommendations.find(r => (r.parking.totalBookings || 0) > 100) || recommendations[2];

    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeTitle}>
              Welcome back, <Text style={styles.welcomeName}>{user?.name || 'Driver'}</Text>
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Here is your parking activity overview and AI recommendations.
            </Text>
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>TOTAL BOOKINGS</Text>
              <MaterialIcons name="event" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{totalBookings}</Text>
            <Text style={styles.statChange}>↑ 12% this month</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>ACTIVE BOOKINGS</Text>
              <MaterialIcons name="location-on" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{activeBookings}</Text>
            <Text style={styles.statInfo}>Currently reserved</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>TOTAL SPENT</Text>
              <MaterialIcons name="currency-rupee" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>₹{totalSpent}</Text>
            <Text style={[styles.statChange, { color: Colors.error }]}>↓ 5% vs last month</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>AVAILABLE SPACES</Text>
              <MaterialIcons name="trending-up" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{availableSpaces}</Text>
            <Text style={styles.statInfo}>of {totalSpaces} total</Text>
          </Card>
        </View>

        {/* Nearby Parking Map */}
        <View style={styles.mapSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <MaterialIcons name="location-on" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Nearby Parking</Text>
            </View>
          </View>

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
        </View>

        {/* AI Recommendations */}
        <View style={styles.recommendationsSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <MaterialIcons name="auto-awesome" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>AI Recommendations</Text>
            </View>
            <Button
              title="Auto Allocate (AI)"
              onPress={() => {
                if (bestOverall) {
                  router.push({
                    pathname: '/parking-details',
                    params: { id: bestOverall.parking.id },
                  });
                }
              }}
              size="small"
              icon={<MaterialIcons name="flash-on" size={18} color={Colors.text} />}
            />
          </View>

          {/* Best Overall */}
          {bestOverall && (
            <View style={styles.recommendationBox}>
              <View style={styles.recommendationHeader}>
                <MaterialIcons name="stars" size={20} color={Colors.primary} />
                <Text style={styles.recommendationTitle}>Best Overall</Text>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>SCORE: {bestOverall.score.toFixed(3)}</Text>
                </View>
              </View>
              <Pressable
                style={styles.parkingRecommendCard}
                onPress={() =>
                  router.push({
                    pathname: '/parking-details',
                    params: { id: bestOverall.parking.id },
                  })
                }
              >
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400' }}
                  style={styles.parkingThumb}
                />
                <View style={styles.parkingRecommendInfo}>
                  <Text style={styles.parkingRecommendTitle} numberOfLines={1}>
                    {bestOverall.parking.title}
                  </Text>
                  <Text style={styles.parkingRecommendPrice}>₹{bestOverall.parking.pricePerHour}/hr</Text>
                  <Text style={styles.parkingRecommendAddress} numberOfLines={2}>
                    {bestOverall.parking.address}
                  </Text>
                </View>
                <View style={styles.bestOverallBadge}>
                  <Text style={styles.badgeText}>BEST OVERALL</Text>
                </View>
              </Pressable>
              <Text style={styles.recommendationReason}>
                Optimal balance of distance (0.0km), price (₹{bestOverall.parking.pricePerHour}/hr), and 88% popularity
              </Text>
            </View>
          )}

          {/* Best Value & Most Popular Grid */}
          <View style={styles.recommendationGrid}>
            {/* Best Value */}
            {bestValue && (
              <View style={styles.recommendationBox}>
                <View style={styles.recommendationHeader}>
                  <MaterialIcons name="attach-money" size={20} color={Colors.success} />
                  <Text style={styles.recommendationTitle}>Best Value</Text>
                  <View style={[styles.scoreBadge, { backgroundColor: Colors.success + '20' }]}>
                    <Text style={[styles.scoreText, { color: Colors.success }]}>SCORE: 10.000</Text>
                  </View>
                </View>
                <Pressable
                  style={styles.parkingRecommendCard}
                  onPress={() =>
                    router.push({
                      pathname: '/parking-details',
                      params: { id: bestValue.parking.id },
                    })
                  }
                >
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400' }}
                    style={styles.parkingThumb}
                  />
                  <View style={styles.parkingRecommendInfo}>
                    <Text style={styles.parkingRecommendTitle} numberOfLines={1}>
                      {bestValue.parking.title}
                    </Text>
                    <Text style={styles.parkingRecommendPrice}>₹{bestValue.parking.pricePerHour}/hr</Text>
                    <Text style={styles.parkingRecommendDistance}>{bestValue.distance.toFixed(1)}km</Text>
                  </View>
                  <View style={[styles.bestOverallBadge, { backgroundColor: Colors.success }]}>
                    <Text style={styles.badgeText}>BEST VALUE</Text>
                  </View>
                </Pressable>
                <Text style={styles.recommendationReason}>
                  Just ₹{bestValue.parking.pricePerHour}/hr — best value option
                </Text>
              </View>
            )}

            {/* Most Popular */}
            {mostPopular && (
              <View style={styles.recommendationBox}>
                <View style={styles.recommendationHeader}>
                  <MaterialIcons name="trending-up" size={20} color={Colors.info} />
                  <Text style={styles.recommendationTitle}>Most Popular</Text>
                  <View style={[styles.scoreBadge, { backgroundColor: Colors.info + '20' }]}>
                    <Text style={[styles.scoreText, { color: Colors.info }]}>SCORE: 95.000</Text>
                  </View>
                </View>
                <Pressable
                  style={styles.parkingRecommendCard}
                  onPress={() =>
                    router.push({
                      pathname: '/parking-details',
                      params: { id: mostPopular.parking.id },
                    })
                  }
                >
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400' }}
                    style={styles.parkingThumb}
                  />
                  <View style={styles.parkingRecommendInfo}>
                    <Text style={styles.parkingRecommendTitle} numberOfLines={1}>
                      {mostPopular.parking.title}
                    </Text>
                    <Text style={styles.parkingRecommendPrice}>₹{mostPopular.parking.pricePerHour}/hr</Text>
                    <Text style={styles.parkingRecommendDistance}>
                      {mostPopular.distance.toFixed(1)}km
                    </Text>
                  </View>
                  <View style={[styles.bestOverallBadge, { backgroundColor: Colors.info }]}>
                    <Text style={styles.badgeText}>MOST POPULAR</Text>
                  </View>
                </Pressable>
                <Text style={styles.recommendationReason}>
                  95% popularity — highest rated by drivers
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    padding: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: Typography.sizes.xl,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  welcomeName: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  welcomeSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceLight,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 32,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  statChange: {
    fontSize: Typography.sizes.xs,
    color: Colors.success,
  },
  statInfo: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  mapSection: {
    marginTop: Spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  mapContainer: {
    height: 300,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  recommendationsSection: {
    padding: Spacing.lg,
    marginTop: Spacing.xl,
  },
  recommendationBox: {
    marginBottom: Spacing.xl,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  recommendationTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    flex: 1,
  },
  scoreBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  parkingRecommendCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  parkingThumb: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
  },
  parkingRecommendInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  parkingRecommendTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  parkingRecommendPrice: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: 4,
  },
  parkingRecommendAddress: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  parkingRecommendDistance: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
  },
  bestOverallBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  recommendationReason: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  recommendationGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
