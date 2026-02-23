import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6A00',
    });

    // Create booking channel
    await Notifications.setNotificationChannelAsync('booking', {
      name: 'Booking Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6A00',
      sound: 'default',
    });

    // Create payment channel
    await Notifications.setNotificationChannelAsync('payment', {
      name: 'Payment Confirmations',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
      sound: 'default',
    });

    // Create availability channel
    await Notifications.setNotificationChannelAsync('availability', {
      name: 'Parking Availability',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#3B82F6',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch (error) {
      console.log('Error getting push token:', error);
      token = null;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any,
  channelId: string = 'default'
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: null, // Show immediately
  });
}

export async function scheduleBookingReminder(
  bookingId: string,
  parkingTitle: string,
  startTime: Date
) {
  // Schedule notification 30 minutes before booking
  const triggerDate = new Date(startTime.getTime() - 30 * 60 * 1000);
  
  if (triggerDate > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Booking Reminder',
        body: `Your parking at ${parkingTitle} starts in 30 minutes`,
        data: { bookingId, type: 'reminder' },
        sound: 'default',
      },
      trigger: triggerDate,
    });
  }
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

export async function getBadgeCountAsync() {
  return await Notifications.getBadgeCountAsync();
}

export async function setBadgeCountAsync(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

export async function dismissAllNotificationsAsync() {
  await Notifications.dismissAllNotificationsAsync();
}
