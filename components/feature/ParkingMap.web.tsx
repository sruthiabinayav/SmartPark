import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { ParkingSpace } from '@/types';
import { Colors } from '@/constants/theme';

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Load Leaflet CSS
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.async = true;

    script.onload = () => {
      initializeMap();
    };

    document.body.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      updateMarkers();
    }
  }, [parkingSpaces]);

  function initializeMap() {
    if (!mapContainerRef.current || typeof window === 'undefined' || !(window as any).L) return;

    const L = (window as any).L;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([userLatitude, userLongitude], 13);
    mapRef.current = map;

    // Add OpenStreetMap tiles (completely free)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add user location marker
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `
        <div style="
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: ${Colors.info};
          border: 3px solid ${Colors.text};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <div style="
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${Colors.text};
          "></div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    L.marker([userLatitude, userLongitude], { icon: userIcon })
      .addTo(map)
      .bindPopup('You are here');

    updateMarkers();
  }

  function updateMarkers() {
    if (!mapRef.current || typeof window === 'undefined' || !(window as any).L) return;

    const L = (window as any).L;

    // Clear existing parking markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add parking markers
    parkingSpaces.forEach(space => {
      const color = getMarkerColor(space);
      const icon = L.divIcon({
        className: 'parking-marker',
        html: `
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: ${color};
            border: 3px solid ${Colors.text};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            position: relative;
          ">
            <span style="
              color: ${Colors.text};
              font-weight: bold;
              font-size: 20px;
            ">P</span>
            ${space.available ? `
              <div style="
                position: absolute;
                top: -4px;
                right: -4px;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: ${Colors.success};
                border: 2px solid ${Colors.text};
              "></div>
            ` : ''}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([space.latitude, space.longitude], { icon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="color: #333; font-family: system-ui, -apple-system, sans-serif;">
            <strong style="font-size: 14px; display: block; margin-bottom: 4px;">${space.title}</strong>
            <div style="font-size: 12px; color: ${Colors.primary}; margin-bottom: 4px;">
              ₹${space.pricePerHour}/hr
            </div>
            <div style="font-size: 11px; color: ${space.available ? Colors.success : Colors.error};">
              ${space.available ? '● Available' : '● Occupied'}
            </div>
            <div style="font-size: 10px; color: #666; margin-top: 4px;">
              Click marker for details
            </div>
          </div>
        `);

      marker.on('click', () => {
        onMarkerPress(space.id);
      });

      markersRef.current.push(marker);
    });
  }

  function getMarkerColor(space: ParkingSpace): string {
    if (!space.available) return Colors.error;
    if (space.pricePerHour < 30) return Colors.success;
    if (space.pricePerHour < 50) return Colors.warning;
    return Colors.primary;
  }

  return (
    <View style={styles.container}>
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
        }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface,
  },
});
