import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useParking } from '@/hooks/useParking';
import { useLanguage } from '@/hooks/useLanguage';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { ParkingCard } from '@/components/feature/ParkingCard';
import { ParkingMap } from '@/components/feature/ParkingMap';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { calculateDistance } from '@/services/aiAllocation';
import { ParkingSpace } from '@/types';

const { width } = Dimensions.get('window');

type ViewMode = 'map' | 'list';
type SortMode = 'nearest' | 'price-low' | 'rating';
type FilterType = 'all' | 'car' | 'bike' | 'covered';

export default function SearchScreen() {
  const router = useRouter();
  const { parkingSpaces } = useParking();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [sortBy, setSortBy] = useState<SortMode>('nearest');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);

  useEffect(() => {
    requestLocation();
  }, []);

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
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

  function getFilteredSpaces(): ParkingSpace[] {
    let filtered = parkingSpaces.filter(s => s.available);

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        s =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      if (filterType === 'covered') {
        filtered = filtered.filter(s => s.features?.includes('covered'));
      } else {
        filtered = filtered.filter(s => s.parkingType === filterType || s.parkingType === 'both');
      }
    }

    // Price filter
    filtered = filtered.filter(s => s.pricePerHour >= priceRange[0] && s.pricePerHour <= priceRange[1]);

    // Sort
    if (location) {
      const { latitude, longitude } = location.coords;
      
      if (sortBy === 'nearest') {
        filtered.sort((a, b) => {
          const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
          const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
          return distA - distB;
        });
      } else if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
      } else if (sortBy === 'rating') {
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      }
    }

    return filtered;
  }

  const filteredSpaces = getFilteredSpaces();

  return (
    <Screen edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or address..."
              placeholderTextColor={Colors.textMuted}
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={20} color={Colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.viewToggle}>
            <Pressable
              style={[styles.viewButton, viewMode === 'map' && styles.viewButtonActive]}
              onPress={() => setViewMode('map')}
            >
              <MaterialIcons
                name="map"
                size={20}
                color={viewMode === 'map' ? Colors.text : Colors.textMuted}
              />
            </Pressable>
            <Pressable
              style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <MaterialIcons
                name="view-list"
                size={20}
                color={viewMode === 'list' ? Colors.text : Colors.textMuted}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.filterBar}>
          <View style={styles.filterChips}>
            {(['all', 'car', 'bike', 'covered'] as FilterType[]).map(type => (
              <Pressable
                key={type}
                style={[styles.filterChip, filterType === type && styles.filterChipActive]}
                onPress={() => setFilterType(type)}
              >
                <Text style={[styles.filterText, filterType === type && styles.filterTextActive]}>
                  {type === 'all' ? 'All Types' : type === 'car' ? 'Car' : type === 'bike' ? 'Bike' : 'Covered'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.sortButton}>
            <MaterialIcons name="sort" size={20} color={Colors.textMuted} />
            <Text style={styles.sortText}>{sortBy === 'nearest' ? 'Nearest' : sortBy === 'price-low' ? 'Price' : 'Rating'}</Text>
          </Pressable>
        </View>

        {viewMode === 'map' ? (
          <View style={styles.mapView}>
            <ParkingMap
              userLatitude={location?.coords.latitude || 13.0827}
              userLongitude={location?.coords.longitude || 80.2707}
              parkingSpaces={filteredSpaces}
              onMarkerPress={(spaceId) =>
                router.push({
                  pathname: '/parking-details',
                  params: { id: spaceId },
                })
              }
            />
            <View style={styles.resultCount}>
              <Text style={styles.resultText}>{filteredSpaces.length} AVAILABLE SPACES</Text>
            </View>
            <View style={styles.sideList}>
              <FlatList
                data={filteredSpaces.slice(0, 6)}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <Card
                    style={styles.miniCard}
                    onPress={() =>
                      router.push({
                        pathname: '/parking-details',
                        params: { id: item.id },
                      })
                    }
                  >
                    <View style={styles.miniCardHeader}>
                      <Text style={styles.miniTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={styles.ratingBadge}>
                        <MaterialIcons name="star" size={14} color={Colors.primary} />
                        <Text style={styles.ratingText}>{item.averageRating?.toFixed(1) || '0.0'}</Text>
                      </View>
                    </View>
                    <Text style={styles.miniAddress} numberOfLines={1}>
                      {item.address}
                    </Text>
                    <View style={styles.miniFooter}>
                      <Text style={styles.miniPrice}>₹{item.pricePerHour}/hr</Text>
                      <Text style={styles.miniDistance}>
                        {location
                          ? calculateDistance(
                              location.coords.latitude,
                              location.coords.longitude,
                              item.latitude,
                              item.longitude
                            ).toFixed(1) + 'km'
                          : '-'}
                      </Text>
                    </View>
                  </Card>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        ) : (
          <FlatList
            style={styles.listView}
            data={filteredSpaces}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ParkingCard
                parking={item}
                distance={
                  location
                    ? calculateDistance(
                        location.coords.latitude,
                        location.coords.longitude,
                        item.latitude,
                        item.longitude
                      )
                    : undefined
                }
                onPress={() =>
                  router.push({
                    pathname: '/parking-details',
                    params: { id: item.id },
                  })
                }
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  viewButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButtonActive: {
    backgroundColor: Colors.primary + '30',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Colors.background,
  },
  filterChips: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  filterTextActive: {
    color: Colors.text,
    fontWeight: Typography.weights.semibold,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
  },
  sortText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  mapView: {
    flex: 1,
    flexDirection: 'row',
  },
  resultCount: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.background + 'E6',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  resultText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.semibold,
  },
  sideList: {
    width: width * 0.35,
    backgroundColor: Colors.background + 'F2',
    padding: Spacing.md,
  },
  miniCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  miniCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  miniTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  miniAddress: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  miniFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniPrice: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  miniDistance: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  listView: {
    flex: 1,
    padding: Spacing.lg,
  },
});
