import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useAlert } from '@/template';
import { Language } from '@/constants/languages';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { showAlert } = useAlert();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  ];

  async function handleLogout() {
    showAlert(t('logout'), t('confirmLogout'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  }

  async function handleLanguageChange(lang: Language) {
    await setLanguage(lang);
  }

  const menuItems = [
    {
      icon: 'smart-toy',
      title: t('aiAssistant'),
      color: Colors.primary,
      onPress: () => router.push('/ai-assistant'),
    },
    {
      icon: 'person-outline',
      title: t('editProfile'),
      onPress: () => router.push('/edit-profile'),
    },
    {
      icon: 'notifications-outline',
      title: t('notifications'),
      onPress: () => router.push('/notification-settings'),
    },
    {
      icon: 'payment',
      title: t('paymentMethods'),
      onPress: () => router.push('/payment-methods'),
    },
    {
      icon: 'help-outline',
      title: t('helpSupport'),
      onPress: () => router.push('/help-support'),
    },
    {
      icon: 'privacy-tip',
      title: t('privacyPolicy'),
      onPress: () => router.push('/privacy-policy'),
    },
  ];

  return (
    <Screen scroll edges={['top']}>
      <View style={styles.container}>
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={48} color={Colors.text} />
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <MaterialIcons
              name={user?.role === 'driver' ? 'directions-car' : 'business'}
              size={16}
              color={Colors.text}
            />
            <Text style={styles.roleText}>
              {user?.role === 'driver' ? t('driver') : t('parkingOwner')}
            </Text>
          </View>
        </Card>

        <Card style={styles.languageCard}>
          <Text style={styles.languageTitle}>{t('language')}</Text>
          <View style={styles.languageGrid}>
            {languages.map(lang => (
              <Pressable
                key={lang.code}
                style={[
                  styles.languageButton,
                  language === lang.code && styles.languageButtonActive,
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.languageName,
                    language === lang.code && styles.languageNameActive,
                  ]}
                >
                  {lang.name}
                </Text>
                {language === lang.code && (
                  <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </Card>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              onPress={item.onPress}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            >
              <View style={styles.menuItemLeft}>
                <MaterialIcons
                  name={item.icon as any}
                  size={24}
                  color={item.color || Colors.textSecondary}
                />
                <Text style={[styles.menuItemText, item.color && { color: item.color }]}>
                  {item.title}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Button
          title={t('logout')}
          onPress={handleLogout}
          variant="outline"
          fullWidth
          icon={<MaterialIcons name="logout" size={20} color={Colors.primary} />}
        />

        <Text style={styles.version}>{t('version')} 1.0.0</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  profileCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  name: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  roleText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  languageCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  languageTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  languageButton: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  languageButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageName: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  languageNameActive: {
    color: Colors.text,
    fontWeight: Typography.weights.semibold,
  },
  menu: {
    marginBottom: Spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuItemText: {
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
  version: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
