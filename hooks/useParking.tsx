import { useContext } from 'react';
import { ParkingContext } from '@/contexts/ParkingContext';

export function useParking() {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within ParkingProvider');
  }
  return context;
}
