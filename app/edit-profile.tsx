import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useAlert } from '@/template';
import { getSupabaseClient } from '@/template';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      showAlert(t('error'), 'Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('user_profiles')
        .update({ name: name.trim() })
        .eq('id', user?.id);

      if (error) throw error;

      showAlert(t('success'), 'Profile updated successfully', [
        { text: t('ok'), onPress: () => router.back() }
      ]);
    } catch (error: any) {
      showAlert(t('error'), error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen edges={['top']}>
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={64} color={Colors.text} />
          </View>
          <Button
            title="Change Photo"
            variant="outline"
            size="small"
            style={styles.photoButton}
          />
        </View>

        <Card style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.label}>{t('name')}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('email')}</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.email}
              editable={false}
            />
            <Text style={styles.helpText}>Email cannot be changed</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleBadge}>
              <MaterialIcons
                name={user?.role === 'driver' ? 'directions-car' : 'business'}
                size={20}
                color={Colors.text}
              />
              <Text style={styles.roleText}>
                {user?.role === 'driver' ? t('driver') : t('parkingOwner')}
              </Text>
            </View>
          </View>
        </Card>

        <Button
          title={loading ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          disabled={loading}
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  photoButton: {
    marginTop: Spacing.md,
  },
  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: Colors.surfaceLight,
  },
  helpText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
});
