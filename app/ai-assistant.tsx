import { View, Text, StyleSheet, FlatList, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { AIMessage } from '@/types';

export default function AIAssistantScreen() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('howCanIHelp'),
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const isDriver = user?.role === 'driver';

  const quickSuggestions = isDriver
    ? [
        'Find cheapest parking near me',
        'Show available parking in Chennai',
        'Book parking for 2 hours',
        'Cancel my booking',
      ]
    : [
        'How to add parking space?',
        'Set my parking as unavailable',
        'View my earnings',
        'Manage bookings',
      ];

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const response = generateAIResponse(input, isDriver);
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1000);
  }

  function generateAIResponse(query: string, isDriver: boolean): string {
    const lowerQuery = query.toLowerCase();

    if (isDriver) {
      if (lowerQuery.includes('cheap') || lowerQuery.includes('affordable')) {
        return 'I found the cheapest parking options near you:\n\n1. Velachery House Parking - ₹20/hour\n2. Hasthampatti Apartment - ₹15/hour\n3. Saibaba Colony Bike Parking - ₹10/hour\n\nWould you like to book any of these?';
      }
      if (lowerQuery.includes('chennai')) {
        return 'Here are available parking spaces in Chennai:\n\n1. T Nagar Shopping Complex - ₹40/hour\n2. Anna Nagar Apartment - ₹25/hour\n3. Velachery House - ₹20/hour\n\nAll are highly rated and available now!';
      }
      if (lowerQuery.includes('book')) {
        return 'To book a parking space:\n\n1. Browse available spaces on the Explore tab\n2. Select your preferred parking\n3. Choose date and time\n4. Confirm booking\n\nWould you like me to show you available spaces nearby?';
      }
      return 'As a driver, I can help you:\n• Find parking spaces near you\n• Get AI recommendations based on price and distance\n• Book and manage your reservations\n• View parking features and ratings\n\nWhat would you like to do?';
    } else {
      if (lowerQuery.includes('add') || lowerQuery.includes('create')) {
        return 'To add a parking space:\n\n1. Go to your Dashboard\n2. Tap "Add Parking" button\n3. Fill in details (title, address, price)\n4. Select location on map\n5. Add features (CCTV, covered, etc.)\n6. Tap "Create"\n\nYour parking will be visible to drivers immediately!';
      }
      if (lowerQuery.includes('unavailable') || lowerQuery.includes('disable')) {
        return 'To mark your parking as unavailable:\n\n1. Go to Dashboard\n2. Find your parking space\n3. Tap the Edit icon\n4. Toggle "Available" switch\n\nDrivers won\'t be able to book it until you enable it again.';
      }
      if (lowerQuery.includes('earning') || lowerQuery.includes('revenue')) {
        return 'Your earnings are shown on your Dashboard:\n• Total Spaces: Number of parking spots\n• Available: Currently bookable spaces\n• Total Revenue: Earnings from all bookings\n\nYou can also see individual space performance and booking history.';
      }
      return 'As a parking owner, I can help you:\n• Add and manage parking spaces\n• Set pricing and availability\n• View earnings and statistics\n• Handle booking requests\n\nWhat would you like assistance with?';
    }
  }

  function selectSuggestion(suggestion: string) {
    setInput(suggestion);
  }

  return (
    <Screen edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                item.role === 'user' ? styles.userMessage : styles.aiMessage,
              ]}
            >
              {item.role === 'assistant' && (
                <View style={styles.aiAvatar}>
                  <MaterialIcons name="smart-toy" size={20} color={Colors.primary} />
                </View>
              )}
              <Card style={styles.messageBubble}>
                <Text style={styles.messageText}>{item.content}</Text>
              </Card>
            </View>
          )}
          ListHeaderComponent={
            <View style={styles.header}>
              <MaterialIcons name="auto-awesome" size={32} color={Colors.primary} />
              <Text style={styles.title}>{t('aiAssistant')}</Text>
              <Text style={styles.subtitle}>{t('howCanIHelp')}</Text>
            </View>
          }
          ListFooterComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>AI is thinking...</Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        <View style={styles.suggestionsContainer}>
          <FlatList
            horizontal
            data={quickSuggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={styles.suggestionChip}
                onPress={() => selectSuggestion(item)}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </Pressable>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsList}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t('askMeAnything')}
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={500}
          />
          <Pressable
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
          >
            <MaterialIcons
              name="send"
              size={24}
              color={input.trim() ? Colors.text : Colors.textMuted}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  messagesList: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  messageContainer: {
    marginBottom: Spacing.md,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    flex: 1,
  },
  messageText: {
    fontSize: Typography.sizes.md,
    color: Colors.text,
    lineHeight: 22,
  },
  loadingContainer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    fontStyle: 'italic' as const,
  },
  suggestionsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  suggestionsList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  suggestionChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surface,
  },
});
