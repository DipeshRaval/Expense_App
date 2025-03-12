import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { ThemedText } from '../ThemedText';
import { useTheme } from '../../context/ThemeContext';
import { themeColors } from '../../constants/theme';

interface TransactionItemProps {
  transaction: {
    title: string;
    amount: number;
    category: string;
    date: string;
    type: 'income' | 'expense';
  };
  style?: ViewStyle;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, style }) => {
  const isIncome = transaction.type === 'income';
  const { isDark } = useTheme();
  const theme = themeColors[isDark ? 'dark' : 'light'];
  
  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: theme.background,
        borderBottomColor: theme.divider
      },
      style
    ]}>
      <View style={[
        styles.iconContainer,
        { 
          backgroundColor: isIncome ? theme.successLight : theme.errorLight
        }
      ]}>
        {isIncome ? (
          <ArrowUpRight size={20} color={theme.success} strokeWidth={2.5} />
        ) : (
          <ArrowDownRight size={20} color={theme.error} strokeWidth={2.5} />
        )}
      </View>
      
      <View style={styles.details}>
        <ThemedText style={[styles.title, { color: theme.text }]}>
          {transaction.title}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          {transaction.category} • {transaction.date}
        </ThemedText>
      </View>
      
      <ThemedText style={[
        styles.amount,
        { color: isIncome ? theme.success : theme.error }
      ]}>
        {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 8,
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontWeight: '500',
    fontSize: 16,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontWeight: '600',
    fontSize: 16,
  },
  income: {
    color: '#22c55e',
  },
  expense: {
    color: '#ef4444',
  }
});

export default TransactionItem;