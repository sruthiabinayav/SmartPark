import { createContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Notification } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchUserNotifications,
  markNotificationAsRead as dbMarkAsRead,
  markAllNotificationsAsRead as dbMarkAllAsRead,
  deleteNotification as dbDeleteNotification,
  subscribeToNotifications,
} from '@/services/database';
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  setBadgeCountAsync,
  scheduleLocalNotification,
} from '@/services/notifications';
import * as Notifications from 'expo-notifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (user) {
      loadNotifications();
      setupRealtimeSubscription();
      setupLocalNotificationListeners();
    } else {
      setNotifications([]);
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user]);

  useEffect(() => {
    // Update badge count
    setBadgeCountAsync(unreadCount);
  }, [unreadCount]);

  async function loadNotifications() {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await fetchUserNotifications(user.id);
      setNotifications(data.map(convertFromDb));
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  function setupRealtimeSubscription() {
    if (!user) return;

    const channel = subscribeToNotifications(user.id, async (payload) => {
      console.log('New notification:', payload);
      
      if (payload.eventType === 'INSERT') {
        const newNotification = convertFromDb(payload.new);
        setNotifications(prev => [newNotification, ...prev]);
        
        // Show local notification
        await scheduleLocalNotification(
          newNotification.title,
          newNotification.message,
          { notificationId: newNotification.id, ...newNotification.data },
          newNotification.type
        );
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }

  function setupLocalNotificationListeners() {
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    responseListener.current = addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      // Handle notification tap - navigate to relevant screen
      const data = response.notification.request.content.data;
      // You can use router here to navigate based on notification type
    });
  }

  async function refreshNotifications() {
    await loadNotifications();
  }

  async function markAsRead(notificationId: string) {
    try {
      await dbMarkAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async function markAllAsRead() {
    if (!user) return;
    
    try {
      await dbMarkAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  async function deleteNotification(notificationId: string) {
    try {
      await dbDeleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

function convertFromDb(notification: any): Notification {
  return {
    id: notification.id,
    userId: notification.user_id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    data: notification.data || {},
    read: notification.read,
    createdAt: notification.created_at,
  };
}
