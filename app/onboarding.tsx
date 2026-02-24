import { View, Text, StyleSheet, Image, Pressable, Dimensions } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Welcome to SmartPark',
    subtitle: 'Find, book, and manage parking spaces across Tamil Nadu with AI-powered recommendations',
    image: require('@/assets/images/onboarding-1.png'),
  },
  {
    id: 2,
    title: 'AI-Powered Recommendations',
    subtitle: 'Get intelligent parking suggestions based on price, distance, availability, and your preferences',
    image: require('@/assets/images/onboarding-2.png'),
  },
  {
    id: 3,
    title: 'Secure & Instant Booking',
    subtitle: 'Book parking in seconds with real-time availability and instant confirmations',
    image: require('@/assets/images/onboarding-3.png'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = slides[currentIndex];

  function handleNext() {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/login');
    }
  }

  function handleSkip() {
    router.replace('/login');
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.surface, Colors.background]}
        style={styles.gradient}
      >
        {/* Skip Button */}
        {currentIndex < slides.length - 1 && (
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>SmartPark</Text>
        </View>

        {/* Slide Image */}
        <Animated.View 
          key={`image-${currentIndex}`}
          entering={FadeIn.duration(600)}
          exiting={FadeOut.duration(300)}
          style={styles.imageContainer}
        >
          <Image
            source={currentSlide.image}
            style={styles.slideImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Content */}
        <Animated.View
          key={`content-${currentIndex}`}
          entering={SlideInRight.duration(400)}
          exiting={SlideOutLeft.duration(300)}
          style={styles.contentContainer}
        >
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
        </Animated.View>

        {/* Pagination */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleNext}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
            </Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    zIndex: 10,
  },
  skipText: {
    fontSize: Typography.sizes.md,
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: Spacing.sm,
  },
  brandName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  slideImage: {
    width: width * 0.8,
    height: height * 0.35,
  },
  contentContainer: {
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceLight,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  button: {
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
});
