import { ParkingSpace, ParkingRecommendation } from '@/types';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Normalize value to 0-100 scale for scoring
 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

/**
 * AI-based parking allocation algorithm
 * Score = (distance × 0.7) + (price × 0.3)
 * Lower score = better match
 */
export function recommendParkingSpaces(
  availableSpaces: ParkingSpace[],
  userLat: number,
  userLon: number,
  maxResults: number = 5
): ParkingRecommendation[] {
  // Filter only available spaces
  const available = availableSpaces.filter(space => space.available);
  
  if (available.length === 0) return [];
  
  // Calculate distances
  const spacesWithDistance = available.map(space => ({
    space,
    distance: calculateDistance(userLat, userLon, space.latitude, space.longitude),
  }));
  
  // Find min/max for normalization
  const distances = spacesWithDistance.map(s => s.distance);
  const prices = available.map(s => s.pricePerHour);
  
  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  // Calculate scores
  const recommendations: ParkingRecommendation[] = spacesWithDistance.map(({ space, distance }) => {
    const normalizedDistance = normalize(distance, minDistance, maxDistance);
    const normalizedPrice = normalize(space.pricePerHour, minPrice, maxPrice);
    
    // Weighted score: distance 70%, price 30%
    const score = normalizedDistance * 0.7 + normalizedPrice * 0.3;
    
    let reason = '';
    if (distance < 1) {
      reason = 'Nearest to your location';
    } else if (space.pricePerHour === minPrice) {
      reason = 'Best price available';
    } else if (score < 30) {
      reason = 'Optimal balance of distance and price';
    } else if (space.rating && space.rating >= 4.7) {
      reason = 'Highly rated by users';
    } else {
      reason = 'Good option nearby';
    }
    
    return {
      parking: space,
      distance,
      score,
      reason,
    };
  });
  
  // Sort by score (lowest = best)
  recommendations.sort((a, b) => a.score - b.score);
  
  return recommendations.slice(0, maxResults);
}

/**
 * Get parking recommendations by specific criteria
 */
export function getRecommendationsByType(
  spaces: ParkingSpace[],
  userLat: number,
  userLon: number,
  type: 'nearest' | 'cheapest' | 'popular'
): ParkingSpace[] {
  const available = spaces.filter(space => space.available);
  
  if (type === 'nearest') {
    return available
      .map(space => ({
        space,
        distance: calculateDistance(userLat, userLon, space.latitude, space.longitude),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map(item => item.space);
  }
  
  if (type === 'cheapest') {
    return [...available]
      .sort((a, b) => a.pricePerHour - b.pricePerHour)
      .slice(0, 3);
  }
  
  if (type === 'popular') {
    return [...available]
      .sort((a, b) => (b.totalBookings || 0) - (a.totalBookings || 0))
      .slice(0, 3);
  }
  
  return [];
}
