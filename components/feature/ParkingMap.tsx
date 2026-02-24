import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { ParkingSpace } from '@/types';

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
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      customMapStyle={mapDarkStyle}
    >
      <Marker
        coordinate={{
          latitude: userLatitude,
          longitude: userLongitude,
        }}
        title="You are here"
        pinColor={Colors.primary}
      />
      {parkingSpaces
        .filter(space => space.available)
        .map(space => (
          <Marker
            key={space.id}
            coordinate={{
              latitude: space.latitude,
              longitude: space.longitude,
            }}
            title={space.title}
            description={`$${space.pricePerHour}/hr`}
            onCalloutPress={() => onMarkerPress(space.id)}
          >
            <View style={styles.customMarker}>
              <MaterialIcons name="local-parking" size={24} color={Colors.text} />
            </View>
          </Marker>
        ))}
    </MapView>
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
  customMarker: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.text,
  },
});
