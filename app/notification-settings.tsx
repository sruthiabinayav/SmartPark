import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/hooks/useLanguage';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useAlert } from '@/template';

export default function NotificationSettingsScreen() {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [priceDrops, setPriceDrops] = useState(true);
  const [recommendations, setRecommendations] = useState(true);
  const [newReviews, setNewReviews] = useState(true);
  const [paymentUpdates, setPaymentUpdates] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const notificationGroups = [
    {
      title: 'Push Notifications',
      items: [
        {
          icon: 'event',
          label: 'Booking Alerts',
          description: 'Get notified about booking confirmations and updates',
          value: bookingAlerts,
          onToggle: setBookingAlerts,
        },
        {
          icon: 'local-offer',
          label: 'Price Drops',
          description: 'Alert me when prices drop on saved parking spaces',
          value: priceDrops,
          onToggle: setPriceDrops,
        },
        {
          icon: 'lightbulb',
          label: 'AI Recommendations',
          description: 'Personalized parking suggestions based on your preferences',
          value: recommendations,
          onToggle: setRecommendations,
        },
        {
          icon: 'star',
          label: 'New Reviews',
          description: 'Notifications when your parking spaces get reviewed',
          value: newReviews,
          onToggle: setNewReviews,
        },
        {
          icon: 'payment',
          label: 'Payment Updates',
          description: 'Transaction confirmations and payment receipts',
          value: paymentUpdates,
          onToggle: setPaymentUpdates,
        },
      ],
    },
    {
      title: 'Other Channels',
      items: [
        {
          icon: 'email',
          label: 'Email Notifications',
          description: 'Receive updates via email',
          value: emailNotifications,
          onToggle: setEmailNotifications,
        },
        {
          icon: 'sms',
          label: 'SMS Alerts',
          description: 'Get text messages for urgent updates',
          value: smsNotifications,
          onToggle: setSmsNotifications,
        },
      ],
    },
  ];

  function handleTestNotification() {
    showAlert(
      'Test Notification',
      'This is how your notifications will look! 🎉',
      [{ text: 'Got it!' }]
    );
  }

  return (
    <Screen scroll edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.description}>
          Customize how you receive updates about bookings, payments, and recommendations
        </Text>

        <Pressable style={styles.testButton} onPress={handleTestNotification}>
          <MaterialIcons name="notifications-active" size={20} color={Colors.primary} />
          <Text style={styles.testButtonText}>Send Test Notification</Text>
        </Pressable>

        {notificationGroups.map((group, groupIndex) => (
          <View key={groupIndex}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <Card style={styles.groupCard}>
              {group.items.map((item, itemIndex) => (
                <View
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex !== group.items.length - 1 && styles.settingItemBorder,
                  ]}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons name={item.icon as any} size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                      <Text style={styles.settingDescription}>{item.description}</Text>
                    </View>
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: Colors.border, true: Colors.primary + '60' }}
                    thumbColor={item.value ? Colors.primary : Colors.surface}
                  />
                </View>
              ))}
            </Card>
          </View>
        ))}

        <Card style={styles.infoCard}>
          <MaterialIcons name="info-outline" size={24} color={Colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Battery Optimization</Text>
            <Text style={styles.infoText}>
              To ensure you receive notifications on time, disable battery optimization for SmartPark in your device settings.
            </Text>
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  description: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  testButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  groupTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  groupCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.info + '10',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
