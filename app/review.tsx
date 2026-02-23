import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { createReview } from '@/services/database';
import { useAlert } from '@/template';

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const bookingId = params.bookingId as string;
  const parkingId = params.parkingId as string;
  const parkingTitle = params.parkingTitle as string;

  async function handleSubmit() {
    if (rating === 0) {
      showAlert(t('error'), 'Please select a rating');
      return;
    }

    if (!comment.trim()) {
      showAlert(t('error'), 'Please write a comment');
      return;
    }

    setLoading(true);
    try {
      await createReview({
        parkingId,
        driverId: user!.id,
        bookingId,
        rating,
        comment: comment.trim(),
      });

      showAlert(t('success'), 'Review submitted successfully!', [
        { text: t('ok'), onPress: () => router.back() },
      ]);
    } catch (error: any) {
      showAlert(t('error'), error.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <MaterialIcons name="rate-review" size={48} color={Colors.primary} />
          <Text style={styles.title}>Rate Your Experience</Text>
          <Text style={styles.subtitle}>{parkingTitle}</Text>
        </Card>

        <Card style={styles.ratingCard}>
          <Text style={styles.label}>How was your parking experience?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <Pressable key={star} onPress={() => setRating(star)} hitSlop={8}>
                <MaterialIcons
                  name={star <= rating ? 'star' : 'star-border'}
                  size={48}
                  color={star <= rating ? Colors.primary : Colors.textMuted}
                />
              </Pressable>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </Text>
          )}
        </Card>

        <Card style={styles.commentCard}>
          <Text style={styles.label}>Share your feedback</Text>
          <TextInput
            style={styles.textInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Tell us about your experience..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={6}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{comment.length}/500</Text>
        </Card>

        <Button
          title={loading ? 'Submitting...' : 'Submit Review'}
          onPress={handleSubmit}
          disabled={loading || rating === 0}
          fullWidth
          size="large"
          style={styles.submitButton}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  card: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  ratingCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.lg,
  },
  ratingText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  commentCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: Spacing.sm,
  },
  submitButton: {
    marginBottom: Spacing.xxl,
  },
});
