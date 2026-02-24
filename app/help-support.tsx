import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/hooks/useLanguage';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useAlert } from '@/template';

export default function HelpSupportScreen() {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const faqItems = [
    {
      question: 'How do I book a parking space?',
      answer: 'Browse available spaces on the map or list view, select your preferred parking, choose time duration, and confirm booking. Payment is processed instantly.',
    },
    {
      question: 'Can I cancel my booking?',
      answer: 'Yes, active bookings can be cancelled from the My Bookings screen. Refund policies depend on cancellation timing.',
    },
    {
      question: 'How does AI recommendation work?',
      answer: 'Our AI analyzes distance, price, availability, your booking history, and preferences to suggest optimal parking spots.',
    },
    {
      question: 'How do I list my parking space?',
      answer: 'Switch to Owner mode, tap Add Parking, enter details, set pricing, and mark location on map. Your space goes live instantly.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept UPI, Credit/Debit cards (Visa, Mastercard, RuPay), and digital wallets (Paytm, PhonePe, Google Pay).',
    },
  ];

  const contactOptions = [
    {
      icon: 'email',
      title: 'Email Support',
      subtitle: 'support@smartpark.com',
      color: Colors.primary,
      onPress: () => Linking.openURL('mailto:support@smartpark.com'),
    },
    {
      icon: 'phone',
      title: 'Call Us',
      subtitle: '+91 1800-123-4567',
      color: Colors.success,
      onPress: () => Linking.openURL('tel:+911800123456 7'),
    },
    {
      icon: 'chat',
      title: 'Live Chat',
      subtitle: 'Chat with our team',
      color: Colors.info,
      onPress: () => showAlert('Live Chat', 'Chat support will be available soon!'),
    },
    {
      icon: 'help',
      title: 'FAQ Center',
      subtitle: 'Browse help articles',
      color: Colors.warning,
      onPress: () => showAlert('FAQ', 'Detailed FAQ section coming soon!'),
    },
  ];

  function handleFAQPress(item: typeof faqItems[0]) {
    showAlert(item.question, item.answer);
  }

  return (
    <Screen scroll edges={['top']}>
      <View style={styles.container}>
        <Card style={styles.headerCard}>
          <MaterialIcons name="support-agent" size={48} color={Colors.primary} />
          <Text style={styles.headerTitle}>How can we help you?</Text>
          <Text style={styles.headerSubtitle}>
            Get instant answers to common questions or contact our support team
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Quick Answers</Text>
        {faqItems.map((item, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.faqItem,
              pressed && styles.faqItemPressed,
            ]}
            onPress={() => handleFAQPress(item)}
          >
            <View style={styles.faqIcon}>
              <MaterialIcons name="help-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.faqQuestion}>{item.question}</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
          </Pressable>
        ))}

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactGrid}>
          {contactOptions.map((option, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.contactCard,
                pressed && styles.contactCardPressed,
              ]}
              onPress={option.onPress}
            >
              <View style={[styles.contactIcon, { backgroundColor: option.color + '20' }]}>
                <MaterialIcons name={option.icon as any} size={28} color={option.color} />
              </View>
              <Text style={styles.contactTitle}>{option.title}</Text>
              <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
            </Pressable>
          ))}
        </View>

        <Card style={styles.reportCard}>
          <MaterialIcons name="report-problem" size={24} color={Colors.warning} />
          <View style={styles.reportContent}>
            <Text style={styles.reportTitle}>Report an Issue</Text>
            <Text style={styles.reportText}>
              Found a bug or have feedback? Let us know and we'll fix it ASAP.
            </Text>
          </View>
          <Pressable
            style={styles.reportButton}
            onPress={() => showAlert('Report Issue', 'Bug reporting system will be available soon')}
          >
            <Text style={styles.reportButtonText}>Report</Text>
          </Pressable>
        </Card>

        <View style={styles.businessHours}>
          <Text style={styles.businessTitle}>Support Hours</Text>
          <View style={styles.hoursRow}>
            <MaterialIcons name="schedule" size={20} color={Colors.textMuted} />
            <Text style={styles.hoursText}>Monday - Friday: 9:00 AM - 6:00 PM IST</Text>
          </View>
          <View style={styles.hoursRow}>
            <MaterialIcons name="schedule" size={20} color={Colors.textMuted} />
            <Text style={styles.hoursText}>Saturday: 10:00 AM - 4:00 PM IST</Text>
          </View>
          <View style={styles.hoursRow}>
            <MaterialIcons name="weekend" size={20} color={Colors.textMuted} />
            <Text style={styles.hoursText}>Sunday: Closed</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  headerCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  faqItemPressed: {
    opacity: 0.7,
  },
  faqIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    lineHeight: 20,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  contactCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  contactCardPressed: {
    opacity: 0.7,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  contactTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.warning + '10',
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  reportText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  reportButton: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  reportButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  businessHours: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
  },
  businessTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  hoursText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
});
