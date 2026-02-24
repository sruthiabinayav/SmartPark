import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useAlert } from '@/template';

interface NavItem {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  route: string;
  badge?: number;
}

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const navItems: NavItem[] = user?.role === 'driver' 
    ? [
        { icon: 'dashboard', label: t('dashboard'), route: '/(tabs)' },
        { icon: 'search', label: t('explore'), route: '/search' },
        { icon: 'event', label: t('myBookings'), route: '/(tabs)/bookings' },
        { icon: 'smart-toy', label: t('aiAssistant'), route: '/ai-assistant' },
        { icon: 'settings', label: t('profile'), route: '/(tabs)/profile' },
      ]
    : [
        { icon: 'dashboard', label: t('dashboard'), route: '/(tabs)' },
        { icon: 'add-circle-outline', label: t('addParking'), route: '/add-parking' },
        { icon: 'event', label: t('bookingRequests'), route: '/(tabs)/bookings' },
        { icon: 'smart-toy', label: t('aiAssistant'), route: '/ai-assistant' },
        { icon: 'settings', label: t('profile'), route: '/(tabs)/profile' },
      ];

  function handleLogout() {
    showAlert(t('logout'), t('confirmLogout'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  }

  function isActive(route: string): boolean {
    if (route === '/(tabs)') {
      return pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
    return pathname.includes(route);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>SmartPark</Text>
      </View>

      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <MaterialIcons name="person" size={32} color={Colors.text} />
        </View>
        <View>
          <Text style={styles.userName}>{user?.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role === 'driver' ? t('driver') : t('parkingOwner')}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.nav} showsVerticalScrollIndicator={false}>
        {navItems.map((item) => {
          const active = isActive(item.route);
          return (
            <Pressable
              key={item.route}
              style={({ pressed }) => [
                styles.navItem,
                active && styles.navItemActive,
                pressed && styles.navItemPressed,
              ]}
              onPress={() => router.push(item.route as any)}
            >
              <MaterialIcons
                name={item.icon}
                size={22}
                color={active ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.navText, active && styles.navTextActive]}>
                {item.label}
              </Text>
              {item.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
              {active && <View style={styles.activeIndicator} />}
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.navItemPressed,
        ]}
        onPress={handleLogout}
      >
        <MaterialIcons name="logout" size={22} color={Colors.error} />
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    backgroundColor: Colors.background,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logo: {
    width: 32,
    height: 32,
  },
  appName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    marginVertical: Spacing.md,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  roleBadge: {
    backgroundColor: Colors.primary + '30',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginTop: 4,
  },
  roleText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  nav: {
    flex: 1,
    padding: Spacing.md,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: Colors.primary + '20',
  },
  navItemPressed: {
    opacity: 0.7,
  },
  navText: {
    fontSize: Typography.sizes.md,
    color: Colors.textMuted,
    flex: 1,
  },
  navTextActive: {
    color: Colors.text,
    fontWeight: Typography.weights.semibold,
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    width: 4,
    height: '70%',
    backgroundColor: Colors.primary,
    borderTopLeftRadius: BorderRadius.sm,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text,
    fontWeight: Typography.weights.bold,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  logoutText: {
    fontSize: Typography.sizes.md,
    color: Colors.error,
    fontWeight: Typography.weights.medium,
  },
});
