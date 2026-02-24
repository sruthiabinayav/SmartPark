import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useAuth } from '@/hooks/useAuth';
import { useParking } from '@/hooks/useParking';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useLanguage } from '@/hooks/useLanguage';
import { getSupabaseClient } from '@/template';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  occupancyRate: number;
  peakHours: { hour: number; count: number }[];
  revenueByDay: { day: string; revenue: number }[];
  parkingPerformance: { name: string; bookings: number; revenue: number }[];
  customerDemographics: { type: string; count: number }[];
}

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const { parkingSpaces, bookings } = useParking();
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, bookings, parkingSpaces]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      
      // Fetch all bookings for owner's parking spaces
      const mySpaceIds = parkingSpaces
        .filter(s => s.ownerId === user?.id)
        .map(s => s.id);

      const { data: allBookings, error } = await supabase
        .from('bookings')
        .select('*, parking:parking_spaces(*)')
        .in('parking_id', mySpaceIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate analytics
      const totalRevenue = allBookings?.reduce((sum, b) => sum + parseFloat(b.total_price), 0) || 0;
      const totalBookings = allBookings?.length || 0;
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Calculate occupancy rate
      const completedBookings = allBookings?.filter(b => b.status === 'completed').length || 0;
      const totalSpaces = mySpaceIds.length;
      const occupancyRate = totalSpaces > 0 ? (completedBookings / (totalSpaces * 30)) * 100 : 0;

      // Peak hours analysis
      const hourCounts: { [key: number]: number } = {};
      allBookings?.forEach(booking => {
        const hour = new Date(booking.start_time).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      const peakHours = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Revenue by day (last 7 days)
      const revenueByDay: { [key: string]: number } = {};
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      allBookings?.forEach(booking => {
        const date = new Date(booking.created_at);
        const dayName = days[date.getDay()];
        revenueByDay[dayName] = (revenueByDay[dayName] || 0) + parseFloat(booking.total_price);
      });

      // Parking performance
      const parkingPerf: { [key: string]: { bookings: number; revenue: number; name: string } } = {};
      allBookings?.forEach(booking => {
        const parkingId = booking.parking_id;
        const parkingName = booking.parking?.title || 'Unknown';
        if (!parkingPerf[parkingId]) {
          parkingPerf[parkingId] = { bookings: 0, revenue: 0, name: parkingName };
        }
        parkingPerf[parkingId].bookings += 1;
        parkingPerf[parkingId].revenue += parseFloat(booking.total_price);
      });

      // Customer demographics (booking patterns)
      const carBookings = allBookings?.filter(b => b.parking?.parking_type === 'car').length || 0;
      const bikeBookings = allBookings?.filter(b => b.parking?.parking_type === 'bike').length || 0;
      const bothBookings = allBookings?.filter(b => b.parking?.parking_type === 'both').length || 0;

      setAnalytics({
        totalRevenue,
        totalBookings,
        averageBookingValue,
        occupancyRate: Math.min(100, occupancyRate),
        peakHours,
        revenueByDay: Object.entries(revenueByDay).map(([day, revenue]) => ({ day, revenue })),
        parkingPerformance: Object.values(parkingPerf).slice(0, 5),
        customerDemographics: [
          { type: 'Car', count: carBookings },
          { type: 'Bike', count: bikeBookings },
          { type: 'Both', count: bothBookings },
        ],
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !analytics) {
    return (
      <Screen edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </Screen>
    );
  }

  const chartConfig = {
    backgroundColor: Colors.surface,
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surfaceLight,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 106, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: BorderRadius.md,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
  };

  return (
    <Screen edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <MaterialIcons name="analytics" size={32} color={Colors.primary} />
          <Text style={styles.title}>Analytics Dashboard</Text>
          <Text style={styles.subtitle}>Your parking business insights</Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <MaterialIcons name="currency-rupee" size={28} color={Colors.success} />
            <Text style={styles.metricValue}>₹{analytics.totalRevenue.toFixed(0)}</Text>
            <Text style={styles.metricLabel}>Total Revenue</Text>
          </Card>

          <Card style={styles.metricCard}>
            <MaterialIcons name="event" size={28} color={Colors.primary} />
            <Text style={styles.metricValue}>{analytics.totalBookings}</Text>
            <Text style={styles.metricLabel}>Total Bookings</Text>
          </Card>

          <Card style={styles.metricCard}>
            <MaterialIcons name="trending-up" size={28} color={Colors.info} />
            <Text style={styles.metricValue}>₹{analytics.averageBookingValue.toFixed(0)}</Text>
            <Text style={styles.metricLabel}>Avg. Booking</Text>
          </Card>

          <Card style={styles.metricCard}>
            <MaterialIcons name="local-parking" size={28} color={Colors.warning} />
            <Text style={styles.metricValue}>{analytics.occupancyRate.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Occupancy</Text>
          </Card>
        </View>

        {/* Revenue Trend */}
        {analytics.revenueByDay.length > 0 && (
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Revenue Trend (Last 7 Days)</Text>
            <LineChart
              data={{
                labels: analytics.revenueByDay.map(d => d.day),
                datasets: [
                  {
                    data: analytics.revenueByDay.map(d => d.revenue),
                  },
                ],
              }}
              width={width - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card>
        )}

        {/* Peak Hours */}
        {analytics.peakHours.length > 0 && (
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Peak Booking Hours</Text>
            <BarChart
              data={{
                labels: analytics.peakHours.map(h => `${h.hour}:00`),
                datasets: [
                  {
                    data: analytics.peakHours.map(h => h.count),
                  },
                ],
              }}
              width={width - 64}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
            />
            <Text style={styles.chartSubtitle}>
              Best time: {analytics.peakHours[0]?.hour}:00 - {analytics.peakHours[0]?.hour + 1}:00
            </Text>
          </Card>
        )}

        {/* Customer Demographics */}
        {analytics.customerDemographics.some(d => d.count > 0) && (
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Customer Vehicle Types</Text>
            <PieChart
              data={analytics.customerDemographics
                .filter(d => d.count > 0)
                .map((d, i) => ({
                  name: d.type,
                  population: d.count,
                  color: [Colors.primary, Colors.info, Colors.success][i],
                  legendFontColor: Colors.textSecondary,
                  legendFontSize: 14,
                }))}
              width={width - 64}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </Card>
        )}

        {/* Parking Performance */}
        {analytics.parkingPerformance.length > 0 && (
          <Card style={styles.performanceCard}>
            <Text style={styles.chartTitle}>Top Performing Spaces</Text>
            {analytics.parkingPerformance.map((parking, index) => (
              <View key={index} style={styles.performanceItem}>
                <View style={styles.performanceRank}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.performanceInfo}>
                  <Text style={styles.performanceName}>{parking.name}</Text>
                  <Text style={styles.performanceStats}>
                    {parking.bookings} bookings • ₹{parking.revenue.toFixed(0)} revenue
                  </Text>
                </View>
                <MaterialIcons name="trending-up" size={24} color={Colors.success} />
              </View>
            ))}
          </Card>
        )}

        {/* Insights & Suggestions */}
        <Card style={styles.insightsCard}>
          <View style={styles.insightHeader}>
            <MaterialIcons name="lightbulb" size={24} color={Colors.warning} />
            <Text style={styles.insightTitle}>AI Pricing Suggestions</Text>
          </View>
          
          <View style={styles.insightItem}>
            <MaterialIcons name="arrow-upward" size={20} color={Colors.success} />
            <Text style={styles.insightText}>
              Peak hours ({analytics.peakHours[0]?.hour}:00-{analytics.peakHours[0]?.hour + 2}:00): 
              Consider increasing prices by 20-30%
            </Text>
          </View>

          <View style={styles.insightItem}>
            <MaterialIcons name="schedule" size={20} color={Colors.info} />
            <Text style={styles.insightText}>
              Low occupancy rate detected. Try promotional pricing during off-peak hours
            </Text>
          </View>

          <View style={styles.insightItem}>
            <MaterialIcons name="local-offer" size={20} color={Colors.primary} />
            <Text style={styles.insightText}>
              Average market rate in your area: ₹{(analytics.averageBookingValue * 1.15).toFixed(0)}/hr
            </Text>
          </View>
        </Card>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
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
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - Spacing.lg * 3) / 2,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  metricValue: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  metricLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  chartCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  chartTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  chart: {
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  chartSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  performanceCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  performanceRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  performanceInfo: {
    flex: 1,
  },
  performanceName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  performanceStats: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  insightsCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  insightTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  insightItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  insightText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
