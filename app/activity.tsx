import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { themeColors } from '../constants/theme';
import { Filter, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import TabTransition from '../components/ui/TabTransition';
import Header from '../components/ui/Header';
import ScreenContainer from '../components/ui/ScreenContainer';
import BottomNavigation from '../components/expense-tracker/BottomNavigation';
import TransactionItem from '../components/expense-tracker/TransactionItem';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import AddExpenseModal from '../components/expense-tracker/AddExpenseModal';

interface Transaction {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'expense' | 'income';
}

type FilterType = 'all' | 'expense' | 'income';

const ActivityScreen = () => {
  const { isDark } = useTheme();
  const theme = themeColors[isDark ? 'dark' : 'light'];
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Sample transactions with actual dates
  const transactions: Transaction[] = [
    // March 2024
    { id: 1, title: 'Grocery Shopping', amount: 45.99, category: 'Food', date: '2024-03-15', type: 'expense' },
    { id: 2, title: 'Salary Deposit', amount: 2500, category: 'Income', date: '2024-03-10', type: 'income' },
    { id: 3, title: 'Netflix Subscription', amount: 12.99, category: 'Entertainment', date: '2024-03-05', type: 'expense' },
    { id: 10, title: 'Coffee Shop', amount: 8.50, category: 'Food', date: '2024-03-18', type: 'expense' },
    { id: 11, title: 'Freelance Project', amount: 750, category: 'Income', date: '2024-03-17', type: 'income' },
    { id: 12, title: 'Gym Membership', amount: 49.99, category: 'Health', date: '2024-03-16', type: 'expense' },
    { id: 13, title: 'Mobile Bill', amount: 65.00, category: 'Utilities', date: '2024-03-14', type: 'expense' },
    { id: 14, title: 'Online Course', amount: 199.99, category: 'Education', date: '2024-03-12', type: 'expense' },
    { id: 15, title: 'Part-time Work', amount: 350, category: 'Income', date: '2024-03-08', type: 'income' },
    { id: 16, title: 'Restaurant Dinner', amount: 85.50, category: 'Food', date: '2024-03-07', type: 'expense' },
    { id: 17, title: 'Book Purchase', amount: 29.99, category: 'Entertainment', date: '2024-03-03', type: 'expense' },
    { id: 18, title: 'Uber Rides', amount: 42.50, category: 'Transport', date: '2024-03-01', type: 'expense' },
    // February 2024
    { id: 4, title: 'Gas Station', amount: 35.40, category: 'Transport', date: '2024-02-28', type: 'expense' },
    { id: 5, title: 'Freelance Work', amount: 850, category: 'Income', date: '2024-02-15', type: 'income' },
    { id: 6, title: 'Restaurant', amount: 68.50, category: 'Food', date: '2024-02-10', type: 'expense' },
    // January 2024
    { id: 7, title: 'Rent Payment', amount: 1200, category: 'Housing', date: '2024-01-31', type: 'expense' },
    { id: 8, title: 'Bonus', amount: 1000, category: 'Income', date: '2024-01-15', type: 'income' },
    { id: 9, title: 'Internet Bill', amount: 59.99, category: 'Utilities', date: '2024-01-05', type: 'expense' },
  ];

  const handleTabChange = (tab: string) => {
    if (tab === 'dashboard') {
      router.push('/');
    } else if (tab === 'calendar') {
      router.push('/calendar');
    } else if (tab === 'cards') {
      router.push('/cards');
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Filter transactions based on active filter and current month
  const filteredTransactions = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        const isCurrentMonth = transactionDate.getMonth() === month && 
                             transactionDate.getFullYear() === year;
        return isCurrentMonth && (activeFilter === 'all' || t.type === activeFilter);
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(t => ({
        ...t,
        date: new Date(t.date).toLocaleDateString('default', { month: 'short', day: 'numeric' })
      }));
  }, [transactions, activeFilter, currentDate]);

  // Calculate totals for current month
  const monthTotals = useMemo(() => {
    const result = {
      income: 0,
      expense: 0
    };
    filteredTransactions.forEach(t => {
      if (t.type === 'income') {
        result.income += t.amount;
      } else {
        result.expense += t.amount;
      }
    });
    return result;
  }, [filteredTransactions]);

  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <TabTransition>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Header
          title="Activity"
          rightIcon={<Filter size={20} color={theme.text} strokeWidth={2.5} />}
          onRightPress={() => setShowFilters(!showFilters)}
        />

        {/* Month Navigation */}
        <View style={[styles.monthNav, { backgroundColor: theme.surface }]}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <ChevronLeft size={24} color={theme.textSecondary} />
          </TouchableOpacity>
          <View>
            <ThemedText style={[styles.monthTitle, { color: theme.text }]}>
              {getMonthName(currentDate)}
            </ThemedText>
            <View style={styles.monthTotals}>
              <ThemedText style={[styles.monthTotal, { color: theme.success }]}>
                +${monthTotals.income.toLocaleString()}
              </ThemedText>
              <ThemedText style={[styles.monthTotal, { color: theme.error }]}>
                -${monthTotals.expense.toLocaleString()}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <ChevronRight size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        {showFilters && (
          <View style={[styles.filterContainer, { backgroundColor: theme.surface }]}>
            {(['all', 'expense', 'income'] as FilterType[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  { 
                    backgroundColor: activeFilter === filter ? theme.primary : theme.background,
                    borderColor: activeFilter === filter ? theme.primary : theme.border
                  }
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <ThemedText style={[
                  styles.filterText,
                  { color: activeFilter === filter ? '#FFFFFF' : theme.textSecondary }
                ]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScreenContainer>
          {filteredTransactions.length > 0 ? (
            <View style={styles.transactionList}>
              {filteredTransactions.map((transaction, index) => (
                <TransactionItem 
                  key={transaction.id} 
                  transaction={transaction}
                  style={{
                    marginBottom: 8,
                    borderRadius: 12,
                    backgroundColor: theme.surface,
                    ...(index !== filteredTransactions.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: 'rgba(0, 0, 0, 0.1)',
                    })
                  }}
                />
              ))}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
              <ThemedText style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                No transactions for {getMonthName(currentDate)}
              </ThemedText>
            </View>
          )}
        </ScreenContainer>

        {/* Add Expense Modal */}
        {showAddExpense && (
          <AddExpenseModal onClose={() => setShowAddExpense(false)} />
        )}

        {/* Floating Action Button */}
        <TouchableOpacity 
          onPress={() => setShowAddExpense(true)}
          style={{
            position: 'absolute',
            right: CONTENT_PADDING,
            bottom: 100,
            width: 160,
            height: 48,
            borderRadius: 12,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.primary,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
              },
              android: {
                elevation: 12,
              },
            }),
          }}
        >
          <Plus size={22} color={theme.background} strokeWidth={2.5} />
          <ThemedText style={styles.floatingButtonText}>Add Expense</ThemedText>
        </TouchableOpacity>

        <BottomNavigation activeTab="activity" setActiveTab={handleTabChange} />
      </View>
    </TabTransition>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_PADDING = SCREEN_WIDTH > 500 ? 24 : 16;

const styles = StyleSheet.create({
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: CONTENT_PADDING,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  monthTotals: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  monthTotal: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: CONTENT_PADDING,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionList: {
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 16,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default React.memo(ActivityScreen); 