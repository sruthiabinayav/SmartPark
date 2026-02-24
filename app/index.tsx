import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  async function checkOnboarding() {
    const seen = await AsyncStorage.getItem('hasSeenOnboarding');
    setHasSeenOnboarding(seen === 'true');
  }

  useEffect(() => {
    if (!loading && hasSeenOnboarding !== null) {
      if (!user) {
        if (!hasSeenOnboarding) {
          router.replace('/onboarding');
        } else {
          router.replace('/login');
        }
      }
    }
  }, [user, loading, hasSeenOnboarding]);

  if (loading || hasSeenOnboarding === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return null;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
