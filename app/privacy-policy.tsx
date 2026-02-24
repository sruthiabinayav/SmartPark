import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export default function PrivacyPolicyScreen() {
  const sections = [
    {
      title: 'Information We Collect',
      icon: 'info',
      content: 'We collect information you provide when creating an account (name, email), booking details, location data when using the app, and payment information processed securely through our payment partners.',
    },
    {
      title: 'How We Use Your Data',
      icon: 'verified-user',
      content: 'Your data helps us provide personalized parking recommendations, process bookings and payments, send booking confirmations and reminders, improve our AI algorithms, and ensure platform security.',
    },
    {
      title: 'Data Sharing',
      icon: 'share',
      content: 'We share minimal necessary information with parking space owners for bookings, payment processors for transactions, and analytics services to improve the app. We never sell your personal data to third parties.',
    },
    {
      title: 'Your Rights',
      icon: 'gavel',
      content: 'You can access, update, or delete your personal information anytime. You can opt-out of marketing communications, request a copy of your data, and close your account permanently at any time.',
    },
    {
      title: 'Data Security',
      icon: 'security',
      content: 'We use industry-standard encryption (SSL/TLS) for data transmission, secure cloud storage with regular backups, access controls and authentication, and regular security audits and updates.',
    },
    {
      title: 'Location Data',
      icon: 'location-on',
      content: 'Location access is used only when the app is active to show nearby parking, provide accurate directions, and improve recommendations. You can disable location access in device settings anytime.',
    },
    {
      title: 'Cookies & Tracking',
      icon: 'cookie',
      content: 'We use essential cookies for app functionality, analytics cookies to understand usage patterns (anonymized), and preference cookies to remember your settings. You can manage cookie preferences in settings.',
    },
    {
      title: 'Children\'s Privacy',
      icon: 'child-care',
      content: 'SmartPark is not intended for users under 18. We do not knowingly collect data from children. If we discover we have collected information from a child, we will delete it immediately.',
    },
    {
      title: 'Updates to Policy',
      icon: 'update',
      content: 'We may update this policy periodically to reflect changes in our practices or legal requirements. You will be notified of significant changes via email or app notification.',
    },
  ];

  return (
    <Screen scroll edges={['top']}>
      <View style={styles.container}>
        <Card style={styles.headerCard}>
          <MaterialIcons name="privacy-tip" size={48} color={Colors.primary} />
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.headerSubtitle}>Last updated: December 2024</Text>
          <Text style={styles.headerText}>
            Your privacy matters to us. This policy explains how we collect, use, and protect your personal information.
          </Text>
        </Card>

        {sections.map((section, index) => (
          <Card key={index} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <MaterialIcons name={section.icon as any} size={24} color={Colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </Card>
        ))}

        <Card style={styles.contactCard}>
          <MaterialIcons name="email" size={24} color={Colors.info} />
          <View style={styles.contactContent}>
            <Text style={styles.contactTitle}>Questions About Privacy?</Text>
            <Text style={styles.contactText}>
              If you have any questions or concerns about our privacy practices, please contact us at:
            </Text>
            <Text style={styles.contactEmail}>privacy@smartpark.com</Text>
          </View>
        </Card>

        <Text style={styles.footerText}>
          By using SmartPark, you agree to this Privacy Policy and our Terms of Service.
        </Text>
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
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  headerText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  sectionContent: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  contactCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.info + '10',
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  contactText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  contactEmail: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.info,
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
    lineHeight: 20,
  },
});
