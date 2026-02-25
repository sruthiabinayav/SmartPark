import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useParking } from '@/hooks/useParking';
import { Screen } from '@/components/layout/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { ParkingSpace, ParkingType, SpaceType } from '@/types';
import { TAMIL_NADU_CITIES } from '@/services/mockData';
import { useAlert } from '@/template';

// Platform-specific map component
let MapViewComponent: any = null;
if (Platform.OS !== 'web') {
  const MapView = require('react-native-maps').default;
  const { Marker, PROVIDER_GOOGLE } = require('react-native-maps');
  
  MapViewComponent = ({ location, onLocationSelect }: any) => (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      onPress={(e: any) => onLocationSelect(e.nativeEvent.coordinate)}
    >
      <Marker
        coordinate={location}
        title="Your Parking Location"
        pinColor={Colors.primary}
      />
    </MapView>
  );
}

export default function AddParkingScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addParkingSpace } = useParking();
  const { showAlert } = useAlert();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [parkingType, setParkingType] = useState<ParkingType>('both');
  const [spaceType, setSpaceType] = useState<SpaceType>('house');
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const availableFeatures = ['Covered', 'CCTV', '24/7 Security', 'EV Charging', 'Washroom'];

  useEffect(() => {
    requestLocation();
  }, []);

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } else {
      // Default to Chennai
      setSelectedLocation({
        latitude: TAMIL_NADU_CITIES[0].lat,
        longitude: TAMIL_NADU_CITIES[0].lng,
      });
    }
  }

  function toggleFeature(feature: string) {
    setFeatures(prev =>
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  }

  async function handleCreateParking() {
    if (!title || !address || !pricePerHour || !selectedLocation) {
      showAlert(t('error'), 'Please fill all required fields');
      return;
    }

    const price = parseFloat(pricePerHour);
    if (isNaN(price) || price <= 0) {
      showAlert(t('error'), 'Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const newParking = {
        ownerId: user!.id,
        title,
        description: description || `${parkingType} parking at ${spaceType}`,
        address,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        pricePerHour: price,
        available: true,
        parkingType,
        spaceType,
        features,
      };

      await addParkingSpace(newParking);
      showAlert(t('success'), 'Parking space added successfully!', [
        { text: t('ok'), onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Add parking error:', error);
      const errorMessage = error.message || 'Failed to add parking space';
      showAlert(t('error'), errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Basic Information</Text>

        <Input
          label={t('parkingTitle')}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Anna Nagar House Parking"
          icon={<MaterialIcons name="title" size={20} color={Colors.textMuted} />}
        />

        <Input
          label={t('description')}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your parking space..."
          multiline
          numberOfLines={3}
          icon={<MaterialIcons name="description" size={20} color={Colors.textMuted} />}
        />

        <Input
          label={t('address')}
          value={address}
          onChangeText={setAddress}
          placeholder="Full address in Tamil Nadu"
          multiline
          numberOfLines={2}
          icon={<MaterialIcons name="location-on" size={20} color={Colors.textMuted} />}
        />

        <Input
          label={`${t('pricePerHour')} (₹)`}
          value={pricePerHour}
          onChangeText={setPricePerHour}
          placeholder="e.g., 20"
          keyboardType="numeric"
          icon={<MaterialIcons name="currency-rupee" size={20} color={Colors.textMuted} />}
        />

        <Text style={styles.sectionTitle}>{t('parkingType')}</Text>
        <View style={styles.typeSelector}>
          {(['car', 'bike', 'both'] as ParkingType[]).map(type => (
            <Pressable
              key={type}
              style={[styles.typeButton, parkingType === type && styles.typeButtonActive]}
              onPress={() => setParkingType(type)}
            >
              <MaterialIcons
                name={type === 'car' ? 'directions-car' : type === 'bike' ? 'two-wheeler' : 'garage'}
                size={24}
                color={parkingType === type ? Colors.text : Colors.textMuted}
              />
              <Text
                style={[styles.typeText, parkingType === type && styles.typeTextActive]}
              >
                {t(type === 'car' ? 'carParking' : type === 'bike' ? 'bikeParking' : 'both')}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('spaceType')}</Text>
        <View style={styles.typeSelector}>
          {(['house', 'apartment', 'public', 'commercial'] as SpaceType[]).map(type => (
            <Pressable
              key={type}
              style={[styles.typeChip, spaceType === type && styles.typeChipActive]}
              onPress={() => setSpaceType(type)}
            >
              <Text style={[styles.typeText, spaceType === type && styles.typeTextActive]}>
                {t(type)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('location')}</Text>
        <Card style={styles.mapCard}>
          {!showMap ? (
            <Pressable style={styles.mapPlaceholder} onPress={() => setShowMap(true)}>
              <MaterialIcons name="map" size={48} color={Colors.primary} />
              <Text style={styles.mapPlaceholderText}>{t('tapToSelectLocation')}</Text>
              {selectedLocation && (
                <Text style={styles.locationText}>
                  {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                </Text>
              )}
            </Pressable>
          ) : (
            <View style={styles.mapContainer}>
              {Platform.OS !== 'web' && selectedLocation ? (
                <MapViewComponent
                  location={selectedLocation}
                  onLocationSelect={setSelectedLocation}
                />
              ) : (
                <View style={styles.webMapPlaceholder}>
                  <MaterialIcons name="map" size={48} color={Colors.textMuted} />
                  <Text style={styles.webMapText}>Map selection available on mobile</Text>
                  {selectedLocation && (
                    <Text style={styles.locationText}>
                      {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                    </Text>
                  )}
                </View>
              )}
              <Button
                title="Confirm Location"
                onPress={() => setShowMap(false)}
                variant="outline"
                size="small"
                style={styles.confirmButton}
              />
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>{t('addFeatures')}</Text>
        <View style={styles.featuresContainer}>
          {availableFeatures.map(feature => (
            <Pressable
              key={feature}
              style={[
                styles.featureChip,
                features.includes(feature) && styles.featureChipActive,
              ]}
              onPress={() => toggleFeature(feature)}
            >
              <MaterialIcons
                name={features.includes(feature) ? 'check-box' : 'check-box-outline-blank'}
                size={20}
                color={features.includes(feature) ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[
                  styles.featureText,
                  features.includes(feature) && styles.featureTextActive,
                ]}
              >
                {feature}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button
          title={loading ? 'Creating...' : t('create')}
          onPress={handleCreateParking}
          disabled={loading}
          fullWidth
          size="large"
          style={styles.createButton}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    minWidth: 100,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
  },
  typeTextActive: {
    color: Colors.text,
  },
  mapCard: {
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  mapPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  mapPlaceholderText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  locationText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  mapContainer: {
    height: 300,
    position: 'relative',
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    gap: Spacing.md,
  },
  webMapText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  confirmButton: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureChipActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  featureText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  featureTextActive: {
    color: Colors.primary,
  },
  createButton: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
});
