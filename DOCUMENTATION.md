# SmartPark - Complete Application Documentation

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Installation & Setup](#installation--setup)
6. [User Roles](#user-roles)
7. [Core Functionality](#core-functionality)
8. [AI Features](#ai-features)
9. [Multi-Language Support](#multi-language-support)
10. [API Reference](#api-reference)
11. [Database Schema](#database-schema)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## Overview

**SmartPark** is a comprehensive smart parking rental platform designed specifically for Tamil Nadu, India. The application connects parking space owners with drivers, utilizing AI-powered recommendations to optimize parking allocation based on distance, price, and popularity.

### Key Highlights
- 🚗 **Dual-Role Platform**: Serves both drivers and parking owners
- 🤖 **AI-Powered**: Smart parking recommendations and assistance
- 🌍 **Tamil Nadu Coverage**: Focused on cities across Tamil Nadu
- 🗣️ **Multi-Language**: Supports Tamil, English, Malayalam, and Hindi
- 💰 **Indian Rupees**: All transactions in ₹ (INR)
- 📱 **Mobile-First**: Built with React Native for iOS and Android

---

## Features

### For Drivers
- ✅ Real-time parking space discovery
- ✅ Interactive map with available parking markers
- ✅ AI-powered recommendations (smart pick, nearest, cheapest, popular)
- ✅ Filter by parking type (car/bike/both)
- ✅ Book parking with date/time selection
- ✅ View booking history
- ✅ AI chat assistant for help
- ✅ Multi-language interface

### For Parking Owners
- ✅ Add parking spaces with map location
- ✅ Set pricing in Indian Rupees (₹)
- ✅ Manage multiple parking spots
- ✅ Track earnings and statistics
- ✅ View booking requests
- ✅ Toggle availability
- ✅ AI assistant for business help

### AI Features
- 🤖 Smart parking allocation algorithm
- 🤖 Conversational AI assistant
- 🤖 Personalized recommendations
- 🤖 Distance and price optimization
- 🤖 Popularity-based suggestions

---

## Technology Stack

### Frontend
- **Framework**: React Native (Expo SDK 52)
- **Language**: TypeScript
- **Routing**: Expo Router (file-based routing)
- **Maps**: react-native-maps with Google Maps
- **Location**: expo-location
- **Storage**: AsyncStorage
- **UI Components**: Custom components + react-native-paper
- **Icons**: @expo/vector-icons (MaterialIcons, Ionicons)
- **Animations**: react-native-reanimated
- **Images**: expo-image

### Backend (Future Integration)
- **Planned**: OnSpace Cloud (Supabase-compatible)
- **Current**: Mock data with localStorage

### State Management
- **Architecture**: Context API + Hooks
- **Contexts**: AuthContext, ParkingContext, LanguageContext
- **Custom Hooks**: useAuth, useParking, useLanguage

---

## Architecture

### Project Structure
```
smartpark/
├── app/                      # Expo Router pages
│   ├── (tabs)/              # Tab navigation
│   │   ├── _layout.tsx      # Tab configuration
│   │   ├── index.tsx        # Home screen
│   │   ├── bookings.tsx     # Bookings screen
│   │   └── profile.tsx      # Profile screen
│   ├── _layout.tsx          # Root layout
│   ├── index.tsx            # Onboarding
│   ├── login.tsx            # Authentication
│   ├── parking-details.tsx  # Parking details
│   ├── booking-confirm.tsx  # Booking confirmation
│   ├── add-parking.tsx      # Add parking (owners)
│   └── ai-assistant.tsx     # AI chat assistant
│
├── components/              # Reusable components
│   ├── ui/                  # Basic UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── layout/              # Layout components
│   │   └── Screen.tsx
│   └── feature/             # Feature-specific components
│       ├── ParkingCard.tsx
│       ├── BookingCard.tsx
│       ├── ParkingMap.tsx
│       └── ParkingMap.web.tsx
│
├── contexts/                # Global state
│   ├── AuthContext.tsx
│   ├── ParkingContext.tsx
│   └── LanguageContext.tsx
│
├── hooks/                   # Custom hooks
│   ├── useAuth.tsx
│   ├── useParking.tsx
│   └── useLanguage.tsx
│
├── services/                # Business logic
│   ├── mockData.ts          # Mock data for Tamil Nadu
│   ├── aiAllocation.ts      # AI recommendation engine
│   └── storage.ts           # AsyncStorage utilities
│
├── constants/               # Configuration
│   ├── theme.ts             # Design tokens
│   ├── styles.ts            # Shared styles
│   └── languages.ts         # Translations
│
├── types/                   # TypeScript definitions
│   └── index.ts
│
└── assets/                  # Static files
    └── images/
        ├── onboarding-1.png
        ├── onboarding-2.png
        └── onboarding-3.png
```

### Data Flow Architecture
```
UI Layer (Screens/Components)
    ↓
Hooks Layer (useAuth, useParking, useLanguage)
    ↓
Context Layer (AuthContext, ParkingContext, LanguageContext)
    ↓
Services Layer (mockData, aiAllocation, storage)
    ↓
Storage Layer (AsyncStorage / Future: OnSpace Cloud)
```

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (macOS) or Android Studio

### Installation Steps

1. **Clone the repository** (or download source code)
   ```bash
   git clone <repository-url>
   cd smartpark
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device

### Configuration

#### Google Maps API Key (Required for Maps)

1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps SDK for Android and iOS
3. Add to `app.json`:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_API_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_API_KEY"
      }
    }
  }
}
```

---

## User Roles

### Driver Role
**Purpose**: Find and book parking spaces

**Capabilities**:
- Browse available parking on map
- Get AI recommendations
- Filter by price/distance/popularity
- Book parking spaces
- Manage bookings
- Chat with AI assistant

**Typical User Flow**:
1. Open app → See map with available parking
2. Get AI recommendations
3. Select parking space
4. View details and pricing
5. Choose date/time
6. Confirm booking
7. Receive confirmation

### Owner Role
**Purpose**: List parking spaces and earn money

**Capabilities**:
- Add parking spaces
- Set location on map
- Configure pricing
- Manage availability
- View earnings dashboard
- Track bookings
- Chat with AI assistant

**Typical User Flow**:
1. Open app → See dashboard
2. Tap "Add Parking"
3. Fill details (title, address, price)
4. Select location on map
5. Add features (CCTV, covered, etc.)
6. Create listing
7. Manage bookings

---

## Core Functionality

### 1. Authentication
**Current**: Mock authentication
**Future**: OnSpace Cloud authentication

**Mock Login**:
- Email: Any email
- Password: Any password
- Role: Driver or Owner

**Implementation**:
```typescript
// AuthContext.tsx
async function login(email: string, password: string, role: UserRole) {
  const user: User = {
    id: `user_${Date.now()}`,
    email,
    name: email.split('@')[0],
    role,
    createdAt: new Date().toISOString(),
  };
  await StorageService.setUser(user);
  setUser(user);
}
```

### 2. Parking Space Management

**Data Model**:
```typescript
interface ParkingSpace {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  pricePerHour: number;        // In Indian Rupees (₹)
  available: boolean;
  parkingType: 'car' | 'bike' | 'both';
  spaceType: 'house' | 'apartment' | 'public' | 'commercial';
  features: string[];          // ['Covered', 'CCTV', 'Security', etc.]
  rating?: number;
  totalBookings?: number;
  createdAt: string;
}
```

**Tamil Nadu Coverage**:
- Chennai
- Coimbatore
- Madurai
- Tiruchirappalli (Trichy)
- Salem
- Tirunelveli
- Tiruppur
- Erode
- Vellore
- Thoothukudi (Tuticorin)

### 3. Booking System

**Data Model**:
```typescript
interface Booking {
  id: string;
  parkingSpaceId: string;
  driverId: string;
  startTime: string;           // ISO timestamp
  endTime: string;             // ISO timestamp
  totalPrice: number;          // Calculated in ₹
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  parkingSpace?: ParkingSpace;
}
```

**Booking Flow**:
1. Driver selects parking
2. Chooses start/end time
3. System calculates price: `duration (hours) × pricePerHour`
4. Driver confirms
5. Booking created with `confirmed` status
6. Appears in both driver and owner views

### 4. Map Integration

**Platform-Specific Implementation**:
```typescript
// Mobile (iOS/Android)
import MapView, { Marker } from 'react-native-maps';

// Web
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
```

**Features**:
- Real-time location tracking
- Custom markers for parking spots
- Cluster markers for multiple nearby spots
- Location permission handling
- Fallback to default location (Chennai)

---

## AI Features

### 1. Smart Parking Allocation

**Algorithm**:
```typescript
function calculateScore(
  distance: number,
  pricePerHour: number,
  popularity: number
): number {
  const normalizedDistance = distance / 10;  // Normalize to 0-1
  const normalizedPrice = pricePerHour / 100;
  const normalizedPopularity = (popularity || 0) / 500;
  
  return (
    normalizedDistance * 0.5 +      // 50% weight on distance
    normalizedPrice * 0.3 +          // 30% weight on price
    (1 - normalizedPopularity) * 0.2 // 20% weight on popularity
  );
}
```

**Recommendation Types**:
- **Smart Pick**: Optimal balance of distance, price, and popularity
- **Nearest**: Sorted by distance only
- **Cheapest**: Sorted by price only
- **Popular**: Sorted by total bookings

### 2. AI Chat Assistant

**Capabilities**:
- **For Drivers**:
  - Find parking near location
  - Explain booking process
  - Suggest cheap parking
  - Cancel bookings

- **For Owners**:
  - Guide through adding parking
  - Explain pricing strategy
  - Show earnings breakdown
  - Manage availability

**Implementation**:
```typescript
// AI response generation based on user query
function generateAIResponse(query: string, isDriver: boolean): string {
  // Pattern matching and context-aware responses
  // Future: Integration with OnSpace AI API
}
```

### 3. Distance Calculation

**Haversine Formula**:
```typescript
function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}
```

---

## Multi-Language Support

### Supported Languages
1. **English** (en) - Default
2. **Tamil** (ta) - தமிழ்
3. **Malayalam** (ml) - മലയാളം
4. **Hindi** (hi) - हिंदी

### Implementation

**Language Context**:
```typescript
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}
```

**Usage**:
```typescript
import { useLanguage } from '@/hooks/useLanguage';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return <Text>{t('welcome')}</Text>;
}
```

**Translation Keys**: 100+ keys covering all UI text

**Storage**: Persisted in AsyncStorage, loaded on app start

---

## API Reference

### Authentication Service

```typescript
// Login
async function login(
  email: string,
  password: string,
  role: 'driver' | 'owner'
): Promise<User>

// Logout
async function logout(): Promise<void>

// Get current user
function getUser(): User | null
```

### Parking Service

```typescript
// Get all parking spaces
function getParkingSpaces(): ParkingSpace[]

// Add parking space
async function addParkingSpace(
  parking: ParkingSpace
): Promise<void>

// Update parking space
async function updateParkingSpace(
  parking: ParkingSpace
): Promise<void>

// Delete parking space
async function deleteParkingSpace(
  id: string
): Promise<void>
```

### Booking Service

```typescript
// Get bookings
function getBookings(): Booking[]

// Add booking
async function addBooking(
  booking: Booking
): Promise<void>

// Update booking
async function updateBooking(
  booking: Booking
): Promise<void>

// Cancel booking
async function cancelBooking(
  id: string
): Promise<void>
```

### AI Service

```typescript
// Get recommendations
function recommendParkingSpaces(
  parkingSpaces: ParkingSpace[],
  userLat: number,
  userLng: number,
  limit: number
): ParkingRecommendation[]

// Get by type
function getRecommendationsByType(
  parkingSpaces: ParkingSpace[],
  userLat: number,
  userLng: number,
  type: 'nearest' | 'cheapest' | 'popular'
): ParkingSpace[]
```

---

## Database Schema

### Future OnSpace Cloud Integration

**Users Table**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('driver', 'owner')),
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Parking Spaces Table**:
```sql
CREATE TABLE parking_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  price_per_hour DECIMAL(10, 2) NOT NULL,
  available BOOLEAN DEFAULT true,
  parking_type TEXT NOT NULL CHECK (parking_type IN ('car', 'bike', 'both')),
  space_type TEXT NOT NULL CHECK (space_type IN ('house', 'apartment', 'public', 'commercial')),
  features TEXT[],
  rating DECIMAL(3, 2),
  total_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Bookings Table**:
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parking_space_id UUID REFERENCES parking_spaces(id),
  driver_id UUID REFERENCES users(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Deployment

### Mobile App Deployment

#### iOS App Store
1. **Prerequisites**:
   - Apple Developer Account ($99/year)
   - Mac with Xcode installed

2. **Build**:
   ```bash
   eas build --platform ios
   ```

3. **Submit**:
   ```bash
   eas submit --platform ios
   ```

#### Google Play Store
1. **Prerequisites**:
   - Google Play Developer Account ($25 one-time)

2. **Build**:
   ```bash
   eas build --platform android
   ```

3. **Submit**:
   ```bash
   eas submit --platform android
   ```

### Backend Deployment (OnSpace Cloud)

1. Enable OnSpace Cloud in project
2. Configure environment variables
3. Deploy Edge Functions for AI
4. Set up database tables
5. Configure authentication
6. Enable real-time features

---

## Troubleshooting

### Common Issues

**1. Maps not showing on Android**
- Ensure Google Maps API key is added to `app.json`
- Enable Maps SDK for Android in Google Cloud Console
- Rebuild app after adding API key

**2. Location permission denied**
- Check device settings
- App uses fallback location (Chennai) if denied
- Request permission on first use

**3. Language not persisting**
- Check AsyncStorage permissions
- Verify LanguageContext is wrapped around app
- Clear app data and relaunch

**4. Booking time validation errors**
- End time must be after start time
- Use DateTimePicker for consistent format
- Minimum booking duration: 1 hour

**5. Map crashes on web**
- Web uses placeholder instead of map
- Full map functionality available on mobile only
- Use mobile device/simulator for testing maps

### Performance Optimization

**1. Large Lists**
- Use `FlatList` with `keyExtractor`
- Implement `getItemLayout` for fixed-height items
- Add `maxToRenderPerBatch` and `windowSize` props

**2. Map Performance**
- Limit markers to visible region
- Use marker clustering for many markers
- Debounce map interactions

**3. Image Optimization**
- Use `expo-image` with blurhash
- Compress images before upload
- Use appropriate sizes for thumbnails

---

## Future Enhancements

### Phase 1 (Immediate)
- [ ] OnSpace Cloud integration
- [ ] Real authentication
- [ ] Database persistence
- [ ] Payment gateway (Razorpay/Paytm)

### Phase 2 (Short-term)
- [ ] Push notifications
- [ ] In-app chat between driver and owner
- [ ] Photo upload for parking spaces
- [ ] Reviews and ratings system

### Phase 3 (Long-term)
- [ ] Dynamic pricing based on demand
- [ ] Parking availability prediction
- [ ] Navigation integration
- [ ] QR code-based check-in/out
- [ ] Revenue analytics dashboard

---

## Support & Contact

For questions, issues, or feature requests:
- **Email**: support@smartpark.in
- **Documentation**: This file
- **Version**: 1.0.0
- **Last Updated**: February 2026

---

## License

SmartPark - Proprietary Software
© 2026 SmartPark India. All rights reserved.

---

## Appendix

### Color Palette
- Primary: `#FF6A00` (Dark Orange)
- Primary Dark: `#E65F00`
- Primary Light: `#FF8C00`
- Background: `#0D0D0D` (Black)
- Surface: `#1A1A1A`
- Text: `#FFFFFF`
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`

### Typography Scale
- Extra Small: 12px
- Small: 14px
- Medium: 16px
- Large: 18px
- Extra Large: 20px
- 2XL: 24px
- 3XL: 32px

### Spacing Scale
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- 2XL: 48px

---

**End of Documentation**
