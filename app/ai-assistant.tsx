import { View, Text, StyleSheet, FlatList, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useParking } from '@/hooks/useParking';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { AIMessage } from '@/types';
import { calculateDistance } from '@/services/aiAllocation';
import * as Location from 'expo-location';

export default function AIAssistantScreen() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { parkingSpaces, bookings } = useParking();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const isDriver = user?.role === 'driver';

  useEffect(() => {
    requestLocation();
    initializeChat();
  }, []);

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    }
  }

  function initializeChat() {
    const userBookings = bookings.filter(b => b.driverId === user?.id);
    const recentBookings = userBookings.slice(0, 3);
    
    let greeting = `Hello ${user?.name}! I'm your SmartPark AI assistant. 🚗\n\n`;
    
    if (isDriver) {
      greeting += `I've analyzed your parking history and preferences:\n\n`;
      if (recentBookings.length > 0) {
        const avgPrice = recentBookings.reduce((sum, b) => sum + b.totalPrice, 0) / recentBookings.length;
        greeting += `• Your average budget: ₹${avgPrice.toFixed(0)}/session\n`;
        greeting += `• Total bookings: ${userBookings.length}\n`;
        greeting += `• Preferred areas: Based on your history\n\n`;
      }
      greeting += `I can help you find parking that matches your:\n✓ Budget preferences\n✓ Usual locations\n✓ Preferred features\n✓ Time patterns\n\nWhat can I help you with today?`;
    } else {
      const mySpaces = parkingSpaces.filter(s => s.ownerId === user?.id);
      const totalRevenue = bookings
        .filter(b => mySpaces.some(s => s.id === b.parkingId))
        .reduce((sum, b) => sum + b.totalPrice, 0);
      
      greeting += `Business Overview:\n\n`;
      greeting += `• Total spaces: ${mySpaces.length}\n`;
      greeting += `• Total revenue: ₹${totalRevenue.toFixed(0)}\n`;
      greeting += `• Active bookings: ${bookings.filter(b => b.status === 'active').length}\n\n`;
      greeting += `I can help you with:\n✓ Pricing optimization\n✓ Space management\n✓ Performance insights\n✓ Customer patterns\n\nHow can I assist you?`;
    }

    setMessages([{
      id: '1',
      role: 'assistant',
      content: greeting,
      timestamp: new Date().toISOString(),
    }]);
  }

  const quickSuggestions = isDriver
    ? [
        'Find parking under ₹30/hr',
        'Show parking near my location',
        'Best parking for 4 hours',
        'Parking with covered space',
      ]
    : [
        'Suggest optimal pricing',
        'Show peak hours analysis',
        'Compare with competitors',
        'Revenue optimization tips',
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
      const response = generateSmartResponse(input, isDriver);
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1500);
  }

  function generateSmartResponse(query: string, isDriver: boolean): string {
    const lowerQuery = query.toLowerCase();
    const userBookings = bookings.filter(b => b.driverId === user?.id);
    const avgPrice = userBookings.length > 0 
      ? userBookings.reduce((sum, b) => sum + b.totalPrice, 0) / userBookings.length 
      : 40;

    if (isDriver) {
      // Budget-based recommendations
      if (lowerQuery.includes('cheap') || lowerQuery.includes('₹') || lowerQuery.includes('budget')) {
        const budget = parseInt(lowerQuery.match(/\d+/)?.[0] || '30');
        const cheapParking = parkingSpaces
          .filter(s => s.available && s.pricePerHour <= budget)
          .sort((a, b) => a.pricePerHour - b.pricePerHour)
          .slice(0, 3);

        if (cheapParking.length === 0) {
          return `I couldn't find parking under ₹${budget}/hr. The cheapest available is ₹${Math.min(...parkingSpaces.map(s => s.pricePerHour))}/hr.\n\nBased on your history (avg: ₹${avgPrice.toFixed(0)}), would you like to see options around that price?`;
        }

        let response = `Great! I found ${cheapParking.length} parking spaces under ₹${budget}/hr:\n\n`;
        cheapParking.forEach((p, i) => {
          const dist = location 
            ? calculateDistance(location.coords.latitude, location.coords.longitude, p.latitude, p.longitude)
            : 0;
          response += `${i + 1}. ${p.title}\n   ₹${p.pricePerHour}/hr • ${dist.toFixed(1)}km away\n   ${p.features?.join(', ') || 'Standard parking'}\n\n`;
        });
        response += `These match your budget preference! Would you like to book any?`;
        return response;
      }

      // Location-based
      if (lowerQuery.includes('near') || lowerQuery.includes('location') || lowerQuery.includes('close')) {
        const nearbyParking = parkingSpaces
          .filter(s => s.available)
          .map(s => ({
            ...s,
            distance: location 
              ? calculateDistance(location.coords.latitude, location.coords.longitude, s.latitude, s.longitude)
              : 999
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 3);

        let response = `Based on your current location, here are the 3 nearest available spaces:\n\n`;
        nearbyParking.forEach((p, i) => {
          response += `${i + 1}. ${p.title}\n   ${p.distance.toFixed(1)}km away • ₹${p.pricePerHour}/hr\n   Rating: ${p.rating?.toFixed(1) || 'New'} ⭐\n\n`;
        });
        return response;
      }

      // Time-based recommendations
      if (lowerQuery.includes('hour') || lowerQuery.includes('time')) {
        const hours = parseInt(lowerQuery.match(/\d+/)?.[0] || '2');
        const recommendedParking = parkingSpaces
          .filter(s => s.available)
          .map(s => ({
            ...s,
            totalCost: s.pricePerHour * hours,
          }))
          .sort((a, b) => a.totalCost - b.totalCost)
          .slice(0, 3);

        let response = `For ${hours} hours of parking, here are the best value options:\n\n`;
        recommendedParking.forEach((p, i) => {
          response += `${i + 1}. ${p.title}\n   ₹${p.totalCost} total (₹${p.pricePerHour}/hr)\n   ${p.features?.includes('covered') ? '🏠 Covered' : '🌤️ Open'}\n\n`;
        });
        return response;
      }

      // Feature-based
      if (lowerQuery.includes('covered') || lowerQuery.includes('cctv') || lowerQuery.includes('security')) {
        const feature = lowerQuery.includes('covered') ? 'covered' : 'cctv';
        const featuredParking = parkingSpaces
          .filter(s => s.available && s.features?.includes(feature))
          .slice(0, 3);

        if (featuredParking.length === 0) {
          return `I couldn't find any parking with ${feature}. Would you like to see highly-rated alternatives?`;
        }

        let response = `Found ${featuredParking.length} parking spaces with ${feature}:\n\n`;
        featuredParking.forEach((p, i) => {
          response += `${i + 1}. ${p.title}\n   ₹${p.pricePerHour}/hr\n   Features: ${p.features?.join(', ')}\n\n`;
        });
        return response;
      }

      return `I can help you find parking based on:\n\n💰 Budget: "Find parking under ₹30/hr"\n📍 Location: "Show nearest parking"\n⏰ Duration: "Best for 3 hours"\n🏠 Features: "Parking with CCTV"\n\nI've learned from your ${userBookings.length} previous bookings that you prefer parking around ₹${avgPrice.toFixed(0)}/hr. What are you looking for today?`;
    } else {
      // Owner responses
      const mySpaces = parkingSpaces.filter(s => s.ownerId === user?.id);
      const myBookings = bookings.filter(b => mySpaces.some(s => s.id === b.parkingId));
      const avgPriceInArea = parkingSpaces.reduce((sum, s) => sum + s.pricePerHour, 0) / parkingSpaces.length;

      if (lowerQuery.includes('pricing') || lowerQuery.includes('price')) {
        const myAvgPrice = mySpaces.reduce((sum, s) => sum + s.pricePerHour, 0) / mySpaces.length;
        
        let response = `📊 Pricing Analysis:\n\n`;
        response += `Your average: ₹${myAvgPrice.toFixed(0)}/hr\n`;
        response += `Market average: ₹${avgPriceInArea.toFixed(0)}/hr\n`;
        response += `Difference: ${myAvgPrice > avgPriceInArea ? '+' : ''}${((myAvgPrice - avgPriceInArea) / avgPriceInArea * 100).toFixed(1)}%\n\n`;
        
        if (myAvgPrice < avgPriceInArea * 0.8) {
          response += `💡 Suggestion: Your prices are 20%+ below market. Consider increasing by ₹5-10/hr to maximize revenue while staying competitive.`;
        } else if (myAvgPrice > avgPriceInArea * 1.2) {
          response += `⚠️ Notice: Your prices are 20%+ above market. This might reduce bookings. Consider competitive pricing or highlighting premium features.`;
        } else {
          response += `✅ Your pricing is competitive! Consider dynamic pricing during peak hours for better revenue.`;
        }
        return response;
      }

      if (lowerQuery.includes('peak') || lowerQuery.includes('hours') || lowerQuery.includes('busy')) {
        const hourCounts: { [key: number]: number } = {};
        myBookings.forEach(booking => {
          const hour = new Date(booking.startTime).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const peakHour = Object.entries(hourCounts)
          .sort(([, a], [, b]) => b - a)[0];

        if (!peakHour) {
          return `No booking data available yet. Keep your spaces listed and I'll analyze patterns as bookings come in!`;
        }

        return `🕐 Peak Hours Analysis:\n\nBusiest time: ${peakHour[0]}:00 (${peakHour[1]} bookings)\n\n💡 Recommendations:\n• Increase prices by 25-30% during ${peakHour[0]}:00-${parseInt(peakHour[0]) + 2}:00\n• Offer discounts during off-peak hours\n• Most bookings happen ${parseInt(peakHour[0]) < 12 ? 'morning' : parseInt(peakHour[0]) < 17 ? 'afternoon' : 'evening'}`;
      }

      if (lowerQuery.includes('competitor') || lowerQuery.includes('compare')) {
        const nearbyCompetitors = parkingSpaces
          .filter(s => s.ownerId !== user?.id)
          .slice(0, 3);

        let response = `🔍 Competitor Analysis:\n\n`;
        nearbyCompetitors.forEach((p, i) => {
          response += `${i + 1}. ${p.title}\n   ₹${p.pricePerHour}/hr • ${p.rating?.toFixed(1) || 'New'}⭐\n   Bookings: ${p.totalBookings || 0}\n\n`;
        });
        response += `💡 Insight: Focus on competitive pricing and collecting positive reviews to stand out!`;
        return response;
      }

      if (lowerQuery.includes('revenue') || lowerQuery.includes('earning') || lowerQuery.includes('optimization')) {
        const totalRevenue = myBookings.reduce((sum, b) => sum + b.totalPrice, 0);
        const avgBookingValue = totalRevenue / myBookings.length || 0;

        return `💰 Revenue Optimization Tips:\n\n📈 Current Performance:\n• Total revenue: ₹${totalRevenue.toFixed(0)}\n• Avg booking: ₹${avgBookingValue.toFixed(0)}\n• Total bookings: ${myBookings.length}\n\n🚀 Growth Strategies:\n1. Add premium features (CCTV, covered)\n2. Dynamic pricing for peak hours\n3. Monthly subscription packages\n4. Referral discounts for regular customers\n5. Professional photos of your space\n\nImplementing these could increase revenue by 30-40%!`;
      }

      return `As your parking business AI advisor, I can help with:\n\n📊 Pricing Strategy: "Suggest optimal pricing"\n⏰ Peak Hours: "Show peak hours analysis"\n🔍 Competition: "Compare with competitors"\n💰 Revenue: "Revenue optimization tips"\n\nYour ${mySpaces.length} spaces have ${myBookings.length} total bookings. What would you like to optimize?`;
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
              <Card style={[
                styles.messageBubble,
                item.role === 'user' && styles.userBubble
              ]}>
                <Text style={styles.messageText}>{item.content}</Text>
              </Card>
            </View>
          )}
          ListHeaderComponent={
            <View style={styles.header}>
              <MaterialIcons name="auto-awesome" size={32} color={Colors.primary} />
              <Text style={styles.title}>AI Parking Assistant</Text>
              <Text style={styles.subtitle}>
                Personalized recommendations based on your preferences
              </Text>
            </View>
          }
          ListFooterComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>Analyzing your preferences...</Text>
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
                <MaterialIcons name="lightbulb-outline" size={16} color={Colors.primary} />
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
            placeholder="Ask about parking, pricing, or preferences..."
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
    fontSize: Typography.sizes.sm,
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
    marginTop: 4,
  },
  messageBubble: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  userBubble: {
    backgroundColor: Colors.primary + '30',
  },
  messageText: {
    fontSize: Typography.sizes.md,
    color: Colors.text,
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.md,
  },
  suggestionsList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
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
    paddingVertical: Spacing.md,
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
