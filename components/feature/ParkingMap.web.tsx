import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { ParkingSpace } from '@/types';

interface ParkingMapProps {
  userLatitude: number;
  userLongitude: number;
  parkingSpaces: ParkingSpace[];
  onMarkerPress: (spaceId: string) => void;
}

export function ParkingMap({
  parkingSpaces,
}: ParkingMapProps) {
  return (
    <View style={styles.webPlaceholder}>
      <MaterialIcons name="map" size={64} color={Colors.textMuted} />
      <Text style={styles.placeholderText}>Map View</Text>
      <Text style={styles.placeholderSubtext}>
        {parkingSpaces.filter(s => s.available).length} parking spaces available
      </Text>
      <Text style={styles.webNote}>
        Interactive map available on mobile devices
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  placeholderText: {
    fontSize: Typography.sizes.xl,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  placeholderSubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  webNote: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.lg,
    fontStyle: 'italic' as const,
  },
});
