import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/hooks/useLanguage';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useAlert } from '@/template';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet';
  label: string;
  details: string;
  icon: string;
  isDefault: boolean;
}

export default function PaymentMethodsScreen() {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  
  const [methods, setMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'upi',
      label: 'Google Pay',
      details: 'user@okaxis',
      icon: 'account-balance',
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      label: 'HDFC Debit Card',
      details: '**** **** **** 4532',
      icon: 'credit-card',
      isDefault: false,
    },
  ]);

  function handleAddMethod() {
    showAlert(
      'Add Payment Method',
      'Choose payment method type:',
      [
        { text: 'UPI', onPress: () => addUPI() },
        { text: 'Card', onPress: () => addCard() },
        { text: 'Wallet', onPress: () => addWallet() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }

  function addUPI() {
    showAlert(t('success'), 'UPI payment setup will open in a secure window');
  }

  function addCard() {
    showAlert(t('success'), 'Card details will be encrypted and stored securely');
  }

  function addWallet() {
    showAlert(t('success'), 'Connect your Paytm/PhonePe wallet');
  }

  function handleSetDefault(id: string) {
    setMethods(methods.map(m => ({ ...m, isDefault: m.id === id })));
    showAlert(t('success'), 'Default payment method updated');
  }

  function handleRemove(id: string) {
    showAlert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setMethods(methods.filter(m => m.id !== id));
          },
        },
      ]
    );
  }

  return (
    <Screen scroll edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.description}>
          Add and manage your payment methods for quick and secure transactions
        </Text>

        <Button
          title="Add Payment Method"
          onPress={handleAddMethod}
          fullWidth
          icon={<MaterialIcons name="add" size={20} color={Colors.text} />}
          style={styles.addButton}
        />

        <Text style={styles.sectionTitle}>Saved Payment Methods</Text>

        {methods.map(method => (
          <Card key={method.id} style={styles.methodCard}>
            <View style={styles.methodHeader}>
              <View style={styles.methodIcon}>
                <MaterialIcons
                  name={method.icon as any}
                  size={28}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodLabel}>{method.label}</Text>
                <Text style={styles.methodDetails}>{method.details}</Text>
              </View>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <MaterialIcons name="check-circle" size={16} color={Colors.success} />
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>

            <View style={styles.methodActions}>
              {!method.isDefault && (
                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleSetDefault(method.id)}
                >
                  <MaterialIcons name="star-outline" size={20} color={Colors.textMuted} />
                  <Text style={styles.actionText}>Set as Default</Text>
                </Pressable>
              )}
              <Pressable
                style={styles.actionButton}
                onPress={() => handleRemove(method.id)}
              >
                <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
                <Text style={[styles.actionText, { color: Colors.error }]}>Remove</Text>
              </Pressable>
            </View>
          </Card>
        ))}

        <Card style={styles.securityCard}>
          <MaterialIcons name="security" size={32} color={Colors.success} />
          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>Secure Payments</Text>
            <Text style={styles.securityText}>
              All payment information is encrypted with industry-standard 256-bit SSL encryption. Your card details are never stored on our servers.
            </Text>
          </View>
        </Card>

        <View style={styles.acceptedMethods}>
          <Text style={styles.acceptedTitle}>Accepted Payment Methods</Text>
          <View style={styles.paymentIcons}>
            {['UPI', 'Visa', 'Mastercard', 'RuPay', 'Paytm'].map(name => (
              <View key={name} style={styles.paymentBadge}>
                <Text style={styles.paymentBadgeText}>{name}</Text>
              </View>
            ))}
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
  description: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  addButton: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  methodCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  methodDetails: {
    fontSize: Typography.sizes.md,
    color: Colors.textMuted,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  defaultText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
  },
  methodActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
  },
  actionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  securityCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.success + '10',
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  securityText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  acceptedMethods: {
    marginTop: Spacing.xl,
  },
  acceptedTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  paymentIcons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  paymentBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentBadgeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
});
