import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { ParkingSpace } from '@/types';
import { useEffect, useState } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

interface ParkingMapProps {
  userLatitude: number;
  userLongitude: number;
  parkingSpaces: ParkingSpace[];
  onMarkerPress: (spaceId: string) => void;
}

export function ParkingMap({
  userLatitude,
  userLongitude,
  parkingSpaces,
  onMarkerPress,
}: ParkingMapProps) {
  const [markerStates, setMarkerStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const newStates: { [key: string]: boolean } = {};
    parkingSpaces.forEach(space => {
      newStates[space.id] = space.available;
    });
    setMarkerStates(newStates);
  }, [parkingSpaces]);

  function getMarkerColor(space: ParkingSpace): string {
    if (!space.available) return Colors.error;
    if (space.pricePerHour < 30) return Colors.success;
    if (space.pricePerHour < 50) return Colors.warning;
    return Colors.primary;
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
      showsUserLocation
      showsMyLocationButton
      showsCompass
      zoomEnabled
      rotateEnabled={false}
    >
      <Marker
        coordinate={{
          latitude: userLatitude,
          longitude: userLongitude,
        }}
        title="You are here"
      >
        <View style={styles.userMarker}>
          <View style={styles.userMarkerPulse} />
          <MaterialIcons name="my-location" size={24} color={Colors.text} />
        </View>
      </Marker>
      
      {parkingSpaces.map(space => (
        <Marker
          key={space.id}
          coordinate={{
            latitude: space.latitude,
            longitude: space.longitude,
          }}
          title={space.title}
          description={`₹${space.pricePerHour}/hr • ${space.available ? 'Available' : 'Occupied'}`}
          onCalloutPress={() => onMarkerPress(space.id)}
        >
          <AnimatedMarker 
            color={getMarkerColor(space)}
            available={space.available}
          />
        </Marker>
      ))}
    </MapView>
  );
}

function AnimatedMarker({ color, available }: { color: string; available: boolean }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (available) {
      scale.value = withRepeat(
        withTiming(1.15, { duration: 1000 }),
        -1,
        true
      );
    } else {
      scale.value = 1;
    }
  }, [available]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.customMarker, { backgroundColor: color }, animatedStyle]}>
      <MaterialIcons 
        name={available ? "local-parking" : "block"} 
        size={24} 
        color={Colors.text} 
      />
      {available && <View style={[styles.markerDot, { backgroundColor: Colors.success }]} />}
    </Animated.View>
  );
}

const mapDarkStyle = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
];

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  userMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.info,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.text,
  },
  userMarkerPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.info + '40',
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.text,
  },
  markerDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.text,
  },
});
