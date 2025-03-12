import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useTheme } from '../../context/ThemeContext';
import { themeColors } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const BalanceCard = () => {
  const { isDark } = useTheme();
  const theme = themeColors[isDark ? 'dark' : 'light'];

  return (
    <LinearGradient
      colors={theme.cardGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.balanceSection}>
        <ThemedText style={[styles.label, styles.textShadow]}>
          Current Balance
        </ThemedText>
        <ThemedText style={[styles.balance, styles.textShadow]}>
          $3,254.80
        </ThemedText>
      </View>
      
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <View style={styles.iconContainer}>
            <TrendingUp size={16} color="#FFFFFF" />
          </View>
          <View>
            <ThemedText style={[styles.statLabel, styles.textShadow]}>
              Income
            </ThemedText>
            <ThemedText style={[styles.statValue, styles.textShadow]}>
              $4,550.00
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.iconContainer}>
            <TrendingDown size={16} color="#FFFFFF" />
          </View>
          <View>
            <ThemedText style={[styles.statLabel, styles.textShadow]}>
              Expenses
            </ThemedText>
            <ThemedText style={[styles.statValue, styles.textShadow]}>
              $1,295.20
            </ThemedText>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  balanceSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  balance: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingTop: 5,
    letterSpacing: 0.5,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statLabel: {
    fontSize: 13,
    marginBottom: 2,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  textShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default BalanceCard;