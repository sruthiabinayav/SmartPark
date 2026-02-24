import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Screen } from '@/components/layout/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useAlert } from '@/template';
import { UserRole } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const router = useRouter();
  const { login, signup, operationLoading } = useAuth();
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('driver');

  useEffect(() => {
    markOnboardingSeen();
  }, []);

  async function markOnboardingSeen() {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
  }

  async function handleSubmit() {
    if (!email || !password) {
      showAlert(t('error'), 'Please enter email and password');
      return;
    }

    if (isSignup && !name) {
      showAlert(t('error'), 'Please enter your name');
      return;
    }

    try {
      if (isSignup) {
        await signup(email, password, name, role);
        showAlert(t('success'), 'Account created successfully!', [
          { text: t('ok'), onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        await login(email, password);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      showAlert(t('error'), error.message || 'Authentication failed');
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logo}>SmartPark</Text>
          <Text style={styles.subtitle}>
            {isSignup ? t('createAccount') : t('welcomeBack')}
          </Text>
        </View>

        {!isSignup && (
          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo Accounts</Text>
            <View style={styles.demoItem}>
              <MaterialIcons name="drive-eta" size={16} color={Colors.primary} />
              <Text style={styles.demoText}>Driver: karthik@email.com / pass123</Text>
            </View>
            <View style={styles.demoItem}>
              <MaterialIcons name="business" size={16} color={Colors.primary} />
              <Text style={styles.demoText}>Owner: murugan@email.com / pass123</Text>
            </View>
            <View style={styles.demoItem}>
              <MaterialIcons name="admin-panel-settings" size={16} color={Colors.primary} />
              <Text style={styles.demoText}>Admin: admin@smartpark.com / admin123</Text>
            </View>
          </View>
        )}

        <View style={styles.form}>
          {isSignup && (
            <>
              <Input
                label={t('name')}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                autoCapitalize="words"
                icon={<MaterialIcons name="person" size={20} color={Colors.textMuted} />}
              />

              <View style={styles.roleSelector}>
                <Text style={styles.roleLabel}>{t('selectRole')}</Text>
                <View style={styles.roleButtons}>
                  <Pressable
                    style={[styles.roleButton, role === 'driver' && styles.roleButtonActive]}
                    onPress={() => setRole('driver')}
                  >
                    <MaterialIcons
                      name="directions-car"
                      size={24}
                      color={role === 'driver' ? Colors.text : Colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === 'driver' && styles.roleButtonTextActive,
                      ]}
                    >
                      {t('driver')}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[styles.roleButton, role === 'owner' && styles.roleButtonActive]}
                    onPress={() => setRole('owner')}
                  >
                    <MaterialIcons
                      name="business"
                      size={24}
                      color={role === 'owner' ? Colors.text : Colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.roleButtonText,
                        role === 'owner' && styles.roleButtonTextActive,
                      ]}
                    >
                      {t('parkingOwner')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}

          <Input
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<MaterialIcons name="email" size={20} color={Colors.textMuted} />}
          />

          <Input
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password (min 6 characters)"
            secureTextEntry
            icon={<MaterialIcons name="lock" size={20} color={Colors.textMuted} />}
          />

          <Button
            title={operationLoading ? (isSignup ? 'Creating...' : 'Logging in...') : (isSignup ? t('signup') : t('login'))}
            onPress={handleSubmit}
            disabled={operationLoading}
            fullWidth
            size="large"
          />

          <Pressable onPress={() => setIsSignup(!isSignup)} style={styles.switchButton}>
            <Text style={styles.switchText}>
              {isSignup ? t('alreadyHaveAccount') : t('dontHaveAccount')}{' '}
              <Text style={styles.switchTextBold}>
                {isSignup ? t('login') : t('signup')}
              </Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: Spacing.sm,
  },
  logo: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
  },
  demoBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  demoTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  demoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  demoText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  form: {
    gap: Spacing.lg,
  },
  roleSelector: {
    marginBottom: Spacing.md,
  },
  roleLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
  },
  roleButtonTextActive: {
    color: Colors.text,
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  switchText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  switchTextBold: {
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
});
