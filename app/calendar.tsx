import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions, PanResponder, Animated } from 'react-native';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import TransactionItem from '../components/expense-tracker/TransactionItem';
import BottomNavigation from '../components/expense-tracker/BottomNavigation';
import AddExpenseModal from '../components/expense-tracker/AddExpenseModal';
import { useTheme } from '../context/ThemeContext';
import { themeColors } from '../constants/theme';
import Header from '../components/ui/Header';
import ScreenContainer from '../components/ui/ScreenContainer';
import ScreenTransition from '../components/ui/ScreenTransition';

// Define transaction type
interface Transaction {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'expense' | 'income';
}

// Define day type
interface CalendarDay {
  day: number | string;
  date: string;
  hasTransactions: boolean;
  isToday?: boolean;
}

// Sample data
const transactions: Record<string, Transaction[]> = {
  '2023-03-01': [
    { id: 5, title: 'Freelance Work', amount: 350, category: 'Income', date: 'Mar 1', type: 'income' },
  ],
  '2023-03-02': [
    { id: 4, title: 'Gas Station', amount: 35.40, category: 'Transport', date: 'Mar 2', type: 'expense' },
  ],
  '2023-03-03': [
    { id: 3, title: 'Netflix Subscription', amount: 12.99, category: 'Entertainment', date: 'Mar 3', type: 'expense' },
  ],
  '2023-03-05': [
    { id: 2, title: 'Salary Deposit', amount: 2500, category: 'Income', date: 'Mar 5', type: 'income' },
  ],
  '2023-03-06': [
    { id: 1, title: 'Grocery Shopping', amount: 45.99, category: 'Food', date: 'Mar 6', type: 'expense' },
  ],
};

// Generate days for the current month
const generateDaysForMonth = (year: number, month: number): CalendarDay[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const currentDay = today.getDate();
  
  const days: CalendarDay[] = [];
  // Add empty spaces for days before the 1st of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ day: '', date: '', hasTransactions: false });
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      day: i,
      date,
      hasTransactions: transactions[date] ? true : false,
      isToday: isCurrentMonth && i === currentDay
    });
  }
  
  return days;
};

// Get month name
const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
};

export default function CalendarScreen() {
  const { isDark } = useTheme();
  const theme = themeColors[isDark ? 'dark' : 'light'];
  const router = useRouter();
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  // Set initial date to April 2025
  const [currentDate, setCurrentDate] = useState(new Date(2025, 3, 1)); // April is month 3 (0-indexed)
  const [selectedDate, setSelectedDate] = useState('2025-04-15'); // Default selected date in April 2025
  
  // Animation values for month transitions
  const position = useRef(new Animated.Value(0)).current;
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = generateDaysForMonth(year, month);

  const goToPreviousMonth = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    // Start animation from 0 to 100% of screen width (moving right)
    Animated.timing(position, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Reset position and update date
      position.setValue(0);
      setCurrentDate(new Date(year, month - 1, 1));
      setIsTransitioning(false);
    });
  };
  
  const goToNextMonth = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    // Start animation from 0 to -100% of screen width (moving left)
    Animated.timing(position, {
      toValue: -1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Reset position and update date
      position.setValue(0);
      setCurrentDate(new Date(year, month + 1, 1));
      setIsTransitioning(false);
    });
  };
  
  // Create pan responder for horizontal swipes
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal gestures
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 3) && 
               Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Calculate position as a fraction of screen width
        position.setValue(gestureState.dx / SCREEN_WIDTH);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isTransitioning) return;
        
        const threshold = 0.2; // 20% of screen width
        
        if (gestureState.dx > SCREEN_WIDTH * threshold) {
          // Swipe right - go to previous month
          goToPreviousMonth();
        } else if (gestureState.dx < -SCREEN_WIDTH * threshold) {
          // Swipe left - go to next month
          goToNextMonth();
        } else {
          // Not enough distance, snap back
          Animated.spring(position, {
            toValue: 0,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  
  // Handle tab navigation
  const handleTabChange = (tab: string) => {
    if (tab === 'dashboard') {
      router.push('/');
    } else if (tab !== 'calendar') {
      router.push(tab === 'activity' ? '/activity' : '/cards');
    }
  };
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Calculate transform based on position
  const translateX = position.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
  });
  
  return (
    <ScreenTransition>
      <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header
          title="Calendar"
        />
        
        {/* Month Navigation */}
        <View style={[styles.monthNav, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <ChevronLeft size={24} color={theme.textSecondary} />
          </TouchableOpacity>
          <ThemedText style={[styles.monthTitle, { color: theme.text }]}>
            {getMonthName(month)} {year}
          </ThemedText>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <ChevronRight size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <ScreenContainer>
          {/* Calendar with swipe gesture */}
          <Animated.View 
            {...panResponder.panHandlers}
            style={[
              styles.calendarContainer,
              { 
                backgroundColor: theme.background,
                transform: [{ translateX }]
              }
            ]}
          >
            {/* Day names */}
            <View style={styles.dayNamesContainer}>
              {dayNames.map((name, index) => (
                <ThemedText 
                  key={index} 
                  style={[
                    styles.dayName, 
                    { color: theme.textSecondary }
                  ]}
                >
                  {name}
                </ThemedText>
              ))}
            </View>
            
            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {days.map((day, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.dayCell,
                    day.date === selectedDate && { 
                      backgroundColor: theme.primary,
                      borderRadius: 100,
                    },
                    day.isToday && day.date !== selectedDate && {
                      backgroundColor: `${theme.primary}20`,
                      borderRadius: 100,
                    }
                  ]}
                  onPress={() => day.date && setSelectedDate(day.date)}
                  disabled={!day.date}
                >
                  {day.day ? (
                    <>
                      <ThemedText style={[
                        styles.dayText,
                        { 
                          color: day.date === selectedDate 
                            ? '#FFFFFF' 
                            : day.isToday 
                              ? theme.primary 
                              : theme.text 
                        },
                        day.isToday && {
                          fontWeight: '700'
                        }
                      ]}>
                        {day.day}
                      </ThemedText>
                      {day.hasTransactions && (
                        <View style={[
                          styles.transactionDot,
                          { 
                            backgroundColor: day.date === selectedDate 
                              ? '#FFFFFF' 
                              : theme.primary
                          }
                        ]} />
                      )}
                    </>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
          
          {/* Transactions for selected date */}
          <View style={styles.transactionsContainer}>
            <ThemedText style={[styles.transactionsTitle, { color: theme.text }]}>
              Transactions
            </ThemedText>
            
            <View style={styles.transactionsList}>
              {transactions[selectedDate] ? (
                <ThemedView style={[
                  styles.transactionCard,
                  { backgroundColor: theme.background }
                ]}>
                  {transactions[selectedDate].map((transaction: Transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                </ThemedView>
              ) : (
                <ThemedView style={[
                  styles.emptyState,
                  { backgroundColor: theme.surface }
                ]}>
                  <ThemedText style={{ color: theme.textSecondary }}>
                    No transactions for this date
                  </ThemedText>
                </ThemedView>
              )}
            </View>
          </View>
        </ScreenContainer>

        {showAddExpense && (
          <AddExpenseModal onClose={() => setShowAddExpense(false)} />
        )}

        {/* Floating Action Button */}
        <TouchableOpacity 
          onPress={() => setShowAddExpense(true)}
          style={[
            styles.floatingButton,
            { 
              backgroundColor: theme.primary,
              bottom: 100
            }
          ]}
        >
          <Plus size={22} color={theme.background} strokeWidth={2.5} />
          <ThemedText style={styles.floatingButtonText}>Add Transaction</ThemedText>
        </TouchableOpacity>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab="calendar" setActiveTab={handleTabChange} />
      </ThemedView>
    </ScreenTransition>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_PADDING = SCREEN_WIDTH > 500 ? 24 : 16;
const CARD_MARGIN = SCREEN_WIDTH > 500 ? 16 : 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: CONTENT_PADDING,
    borderBottomWidth: 1,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  calendarContainer: {
    paddingHorizontal: CONTENT_PADDING,
  },
  dayNamesContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100/7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  transactionsContainer: {
    flex: 1,
    marginTop: 8,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  transactionsList: {
    flex: 1,
  },
  transactionCard: {
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  emptyState: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButton: {
    position: 'absolute',
    right: CONTENT_PADDING,
    width: 160,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 