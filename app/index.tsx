import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    image: require('@/assets/images/onboarding-1.png'),
    title: 'Find Parking Instantly',
    description: 'Discover available parking spaces near you in real-time',
  },
  {
    image: require('@/assets/images/onboarding-2.png'),
    title: 'AI-Powered Recommendations',
    description: 'Smart allocation based on distance, price, and popularity',
  },
  {
    image: require('@/assets/images/onboarding-3.png'),
    title: 'Secure & Easy Booking',
    description: 'Book and manage your parking with confidence',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const scrollX = useSharedValue(0);
  const currentIndex = useRef(0);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)');
    }
  }, [user, loading]);

  useEffect(() => {
    const interval = setInterval(() => {
      currentIndex.current = (currentIndex.current + 1) % slides.length;
      scrollX.value = withTiming(currentIndex.current * width, { duration: 500 });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const slideAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: -scrollX.value }],
    };
  });

  if (loading) {
    return (
      <Screen edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.slidesContainer}>
          <Animated.View style={[styles.slidesWrapper, slideAnimatedStyle]}>
            {slides.map((slide, index) => (
              <View key={index} style={styles.slide}>
                <Image
                  source={slide.image}
                  style={styles.image}
                  contentFit="cover"
                  transition={200}
                />
              </View>
            ))}
          </Animated.View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>SmartPark</Text>
            <Text style={styles.tagline}>Parking Made Simple</Text>
          </View>

          <View style={styles.dots}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentIndex.current === index && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.textContent}>
            <Text style={styles.title}>{slides[currentIndex.current].title}</Text>
            <Text style={styles.description}>
              {slides[currentIndex.current].description}
            </Text>
          </View>

          <View style={styles.actions}>
            <Button
              title="Get Started"
              onPress={() => router.push('/login')}
              fullWidth
              size="large"
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
  },
  slidesContainer: {
    height: height * 0.5,
    overflow: 'hidden',
  },
  slidesWrapper: {
    flexDirection: 'row',
    width: width * slides.length,
  },
  slide: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height * 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceLight,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  textContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: Spacing.md,
  },
});
