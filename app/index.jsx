import React, { useState, useCallback } from "react";
import { View, TouchableOpacity, Dimensions, Platform } from "react-native";
import { Plus, Moon, Sun } from "lucide-react-native";
import { useRouter } from "expo-router";

// Import components
import BalanceCard from "../components/expense-tracker/BalanceCard";
import ExpenseCategoryChart from "../components/expense-tracker/ExpenseCategoryChart";
import TransactionItem from "../components/expense-tracker/TransactionItem";
import CategoryCard from "../components/expense-tracker/CategoryCard";
import BottomNavigation from "../components/expense-tracker/BottomNavigation";
import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";
import { useModal } from "../context/ModalContext";
import { themeColors } from "../constants/theme";
import ScreenTransition from "../components/ui/ScreenTransition";
import Header from "../components/ui/Header";
import ScreenContainer from "../components/ui/ScreenContainer";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CONTENT_PADDING = SCREEN_WIDTH > 500 ? 24 : 16;
const CARD_MARGIN = SCREEN_WIDTH > 500 ? 16 : 12;

const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { isDark, toggleTheme } = useTheme();
  const { openAddExpense } = useModal();
  const theme = themeColors[isDark ? "dark" : "light"];
  const router = useRouter();

  const handleTabChange = useCallback(
    (tab) => {
      setActiveTab(tab);
      if (tab !== "dashboard") {
        router.push(`/${tab}`);
      }
    },
    [router]
  );

  // Sample data
  const recentTransactions = [
    {
      id: 1,
      title: "Grocery Shopping",
      amount: 45.99,
      category: "Food",
      date: "Mar 6",
      type: "expense",
    },
    {
      id: 2,
      title: "Salary Deposit",
      amount: 2500,
      category: "Income",
      date: "Mar 5",
      type: "income",
    },
    {
      id: 3,
      title: "Netflix Subscription",
      amount: 12.99,
      category: "Entertainment",
      date: "Mar 3",
      type: "expense",
    },
    {
      id: 4,
      title: "Gas Station",
      amount: 35.4,
      category: "Transport",
      date: "Mar 2",
      type: "expense",
    },
  ];

  const categories = [
    { name: "Food", spent: 245.3, budget: 350, color: "#f97316" },
    { name: "Transport", spent: 120.75, budget: 200, color: "#3b82f6" },
    { name: "Entertainment", spent: 85.99, budget: 150, color: "#a855f7" },
    { name: "Utilities", spent: 145.2, budget: 250, color: "#22c55e" },
  ];

  // Data for pie chart
  const chartData = categories.map((cat) => ({
    name: cat.name,
    value: cat.spent,
    color: cat.color,
  }));

  return (
    <ScreenTransition>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Header
          title="ExpenseTracker"
          rightIcon={
            isDark ? (
              <Sun size={20} color={theme.text} strokeWidth={2.5} />
            ) : (
              <Moon size={20} color={theme.text} strokeWidth={2.5} />
            )
          }
          onRightPress={toggleTheme}
        />

        <ScreenContainer contentContainerStyle={{ paddingBottom: 100 }}>
          <BalanceCard />
          <ThemedView
            style={[
              styles.chartContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Spending by Category
            </ThemedText>
            <ExpenseCategoryChart data={chartData} />
          </ThemedView>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
                Recent Transactions
              </ThemedText>
              <TouchableOpacity onPress={() => handleTabChange("activity")}>
                <ThemedText
                  style={[styles.seeAllText, { color: theme.primary }]}
                >
                  See All
                </ThemedText>
              </TouchableOpacity>
            </View>
            <ThemedView
              style={[
                styles.transactionList,
                { backgroundColor: theme.background },
              ]}
            >
              {recentTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </ThemedView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
                Spending Categories
              </ThemedText>
            </View>
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </View>
        </ScreenContainer>

        {/* Floating Action Button */}
        <TouchableOpacity
          onPress={openAddExpense}
          style={[
            styles.floatingButton,
            {
              backgroundColor: theme.primary,
              bottom: 100,
            },
          ]}
        >
          <Plus size={24} color={theme.background} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          setActiveTab={handleTabChange}
        />
      </View>
    </ScreenTransition>
  );
};

const styles = {
  chartContainer: {
    borderRadius: 12,
    padding: CONTENT_PADDING,
    marginTop: CARD_MARGIN,
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
  section: {
    marginTop: CARD_MARGIN * 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: CARD_MARGIN,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH > 500 ? 20 : 18,
    fontWeight: "600",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  transactionList: {
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
};

export default React.memo(HomeScreen);
