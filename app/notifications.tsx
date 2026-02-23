import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/hooks/useLanguage';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Notification } from '@/types';

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'booking':
        return 'event';
      case 'payment':
        return 'payment';
      case 'availability':
        return 'local-parking';
      case 'review':
        return 'star';
      default:
        return 'notifications';
    }
  }

  function handleNotificationPress(notification: Notification) {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data.bookingId) {
      router.push('/(tabs)/bookings');
    } else if (notification.data.parkingId) {
      router.push({
        pathname: '/parking-details',
        params: { id: notification.data.parkingId },
      });
    }
  }

  if (loading) {
    return (
      <Screen edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('notifications')}</Text>
          {notifications.length > 0 && (
            <Button
              title="Mark All Read"
              onPress={markAllAsRead}
              variant="outline"
              size="small"
            />
          )}
        </View>

        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleNotificationPress(item)}>
              <Card style={[styles.notificationCard, !item.read && styles.unreadCard]}>
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name={getNotificationIcon(item.type) as any}
                    size={24}
                    color={item.read ? Colors.textMuted : Colors.primary}
                  />
                </View>
                <View style={styles.content}>
                  <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>
                    {item.title}
                  </Text>
                  <Text style={styles.notificationMessage}>{item.message}</Text>
                  <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
                </View>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                  hitSlop={8}
                >
                  <MaterialIcons name="close" size={20} color={Colors.textMuted} />
                </Pressable>
              </Card>
            </Pressable>
          )}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <MaterialIcons name="notifications-none" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptySubtext}>
                You'll see booking alerts and updates here
              </Text>
            </Card>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
  },
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  unreadCard: {
    backgroundColor: Colors.primary + '10',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  unreadText: {
    color: Colors.text,
  },
  notificationMessage: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  time: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xxl,
    marginTop: Spacing.xxl,
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
