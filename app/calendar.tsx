import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import TransactionItem from "../components/expense-tracker/TransactionItem";
import BottomNavigation from "../components/expense-tracker/BottomNavigation";
import AddExpenseModal from "../components/expense-tracker/AddExpenseModal";
import { useTheme } from "../context/ThemeContext";
import { themeColors } from "../constants/theme";
import Header from "../components/ui/Header";
import ScreenContainer from "../components/ui/ScreenContainer";
import ScreenTransition from "../components/ui/ScreenTransition";

// Define transaction type
interface Transaction {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: "expense" | "income";
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
  "2023-03-01": [
    {
      id: 5,
      title: "Freelance Work",
      amount: 350,
      category: "Income",
      date: "Mar 1",
      type: "income",
    },
  ],
  "2023-03-02": [
    {
      id: 4,
      title: "Gas Station",
      amount: 35.4,
      category: "Transport",
      date: "Mar 2",
      type: "expense",
    },
  ],
  "2023-03-03": [
    {
      id: 3,
      title: "Netflix Subscription",
      amount: 12.99,
      category: "Entertainment",
      date: "Mar 3",
      type: "expense",
    },
  ],
  "2023-03-05": [
    {
      id: 2,
      title: "Salary Deposit",
      amount: 2500,
      category: "Income",
      date: "Mar 5",
      type: "income",
    },
  ],
  "2023-03-06": [
    {
      id: 1,
      title: "Grocery Shopping",
      amount: 45.99,
      category: "Food",
      date: "Mar 6",
      type: "expense",
    },
  ],
};

// Generate days for the current month
const generateDaysForMonth = (year: number, month: number): CalendarDay[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === month && today.getFullYear() === year;
  const currentDay = today.getDate();

  const days: CalendarDay[] = [];
  // Add empty spaces for days before the 1st of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ day: "", date: "", hasTransactions: false });
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      i
    ).padStart(2, "0")}`;
    days.push({
      day: i,
      date,
      hasTransactions: transactions[date] ? true : false,
      isToday: isCurrentMonth && i === currentDay,
    });
  }

  return days;
};

// Get month name
const getMonthName = (month: number): string => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month];
};

export default function CalendarScreen() {
  const { isDark } = useTheme();
  const theme = themeColors[isDark ? "dark" : "light"];
  const router = useRouter();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Use useRef to track the current date to avoid stale closures
  const currentDateRef = useRef(new Date());

  // Set initial date to current date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Track the selected day number
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(
    new Date().getDate()
  );

  // Update the ref whenever the state changes
  useEffect(() => {
    currentDateRef.current = currentDate;
  }, [currentDate]);

  // Update selectedDayNumber when selectedDate changes
  useEffect(() => {
    const dayNumber = parseInt(selectedDate.split("-")[2]);
    setSelectedDayNumber(dayNumber);
  }, [selectedDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = generateDaysForMonth(year, month);

  const goToMonth = (direction: number) => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    // Use the ref to get the most up-to-date value
    const newDate = new Date(currentDateRef.current);
    newDate.setMonth(newDate.getMonth() + direction);

    console.log("Moving from", currentDateRef.current, "to", newDate);

    // Update both the state and the ref
    setCurrentDate(newDate);
    currentDateRef.current = newDate;

    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  // Create pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal gestures
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2);
      },
      onPanResponderRelease: (_, gestureState) => {
        const SWIPE_THRESHOLD = 50; // Minimum distance for swipe

        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe right - go to previous month
          console.log("goToPreviousMonth");
          goToMonth(-1);
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left - go to next month
          console.log("goToNextMonth");
          goToMonth(1);
        }
      },
    })
  ).current;

  // Handle tab navigation
  const handleTabChange = (tab: string) => {
    if (tab === "dashboard") {
      router.push("/");
    } else if (tab !== "calendar") {
      router.push(tab === "activity" ? "/activity" : "/cards");
    }
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <ScreenTransition>
      <ThemedView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Header title="Calendar" />

        {/* Month Navigation */}
        <View
          style={[
            styles.monthNav,
            { backgroundColor: theme.surface, borderBottomColor: theme.border },
          ]}
        >
          <TouchableOpacity
            onPress={() => goToMonth(-1)}
            style={styles.navButton}
          >
            <ChevronLeft size={24} color={theme.textSecondary} />
          </TouchableOpacity>
          <ThemedText style={[styles.monthTitle, { color: theme.text }]}>
            {getMonthName(month)} {year}
          </ThemedText>
          <TouchableOpacity
            onPress={() => goToMonth(1)}
            style={styles.navButton}
          >
            <ChevronRight size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScreenContainer>
          {/* Calendar with swipe gestures */}
          <View
            {...panResponder.panHandlers}
            style={[
              styles.calendarContainer,
              { backgroundColor: theme.surface },
            ]}
          >
            {/* Day names */}
            <View style={styles.dayNamesContainer}>
              {dayNames.map((name, index) => (
                <ThemedText
                  key={index}
                  style={[styles.dayName, { color: theme.textSecondary }]}
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
                      borderRadius: 8,
                    },
                    day.isToday && {
                      backgroundColor:
                        day.date === selectedDate
                          ? theme.primary
                          : `${theme.primary}20`,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.primary,
                    },
                    typeof day.day === "number" &&
                      day.day === selectedDayNumber &&
                      day.date !== selectedDate && {
                        backgroundColor: `${theme.textSecondary}20`,
                        borderRadius: 8,
                      },
                  ]}
                  onPress={() => {
                    if (day.date) {
                      setSelectedDate(day.date);
                      setSelectedDayNumber(
                        typeof day.day === "number"
                          ? day.day
                          : new Date().getDate()
                      );
                    }
                  }}
                  disabled={!day.date}
                >
                  {day.day ? (
                    <>
                      <ThemedText
                        style={[
                          styles.dayText,
                          {
                            color:
                              day.date === selectedDate
                                ? "#FFFFFF"
                                : day.isToday
                                ? theme.primary
                                : day.day === selectedDayNumber
                                ? theme.textSecondary
                                : theme.text,
                            fontWeight:
                              day.isToday || day.day === selectedDayNumber
                                ? "700"
                                : "500",
                          },
                        ]}
                      >
                        {day.day}
                      </ThemedText>
                      {day.hasTransactions && (
                        <View
                          style={[
                            styles.transactionDot,
                            {
                              backgroundColor:
                                day.date === selectedDate
                                  ? "#FFFFFF"
                                  : theme.primary,
                            },
                          ]}
                        />
                      )}
                    </>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Transactions for selected date */}
          <View style={styles.transactionsContainer}>
            <ThemedText
              style={[styles.transactionsTitle, { color: theme.text }]}
            >
              Transactions
            </ThemedText>

            {transactions[selectedDate] ? (
              <ThemedView
                style={[
                  styles.transactionCard,
                  { backgroundColor: theme.surface },
                ]}
              >
                {transactions[selectedDate].map((transaction: Transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </ThemedView>
            ) : (
              <ThemedView
                style={[styles.emptyState, { backgroundColor: theme.surface }]}
              >
                <ThemedText style={{ color: theme.textSecondary }}>
                  No transactions for this date
                </ThemedText>
              </ThemedView>
            )}
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
            { backgroundColor: theme.primary, bottom: 100 },
          ]}
        >
          <Plus size={24} color={theme.background} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab="calendar" setActiveTab={handleTabChange} />
      </ThemedView>
    </ScreenTransition>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CONTENT_PADDING = SCREEN_WIDTH > 500 ? 24 : 16;
const CARD_MARGIN = SCREEN_WIDTH > 500 ? 16 : 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: CONTENT_PADDING,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  calendarContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  dayNamesContainer: {
    flexDirection: "row",
    marginBottom: 4,
  },
  dayName: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 2,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
  },
  transactionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  transactionsContainer: {
    flex: 1,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  transactionCard: {
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
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
    alignItems: "center",
    justifyContent: "center",
  },
  floatingButton: {
    position: "absolute",
    right: CONTENT_PADDING,
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
    }),
  },
});
