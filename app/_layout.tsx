import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '@/template';
import { AuthProvider } from '@/contexts/AuthContext';
import { ParkingProvider } from '@/contexts/ParkingContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <LanguageProvider>
          <AuthProvider>
            <ParkingProvider>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen 
                  name="parking-details"
                  options={{
                    headerShown: true,
                    headerTitle: 'Parking Details',
                    headerStyle: { backgroundColor: '#0D0D0D' },
                    headerTintColor: '#FFFFFF',
                  }}
                />
                <Stack.Screen 
                  name="booking-confirm"
                  options={{
                    headerShown: true,
                    headerTitle: 'Confirm Booking',
                    headerStyle: { backgroundColor: '#0D0D0D' },
                    headerTintColor: '#FFFFFF',
                  }}
                />
                <Stack.Screen 
                  name="add-parking"
                  options={{
                    headerShown: true,
                    headerTitle: 'Add Parking Space',
                    headerStyle: { backgroundColor: '#0D0D0D' },
                    headerTintColor: '#FFFFFF',
                  }}
                />
                <Stack.Screen 
                  name="ai-assistant"
                  options={{
                    headerShown: true,
                    headerTitle: 'AI Assistant',
                    headerStyle: { backgroundColor: '#0D0D0D' },
                    headerTintColor: '#FFFFFF',
                  }}
                />
              </Stack>
            </ParkingProvider>
          </AuthProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
