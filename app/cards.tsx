import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { Plus, CreditCard, ChevronRight } from "lucide-react-native";
import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { LinearGradient } from "expo-linear-gradient";
import TransactionItem from "../components/expense-tracker/TransactionItem";
import BottomNavigation from "../components/expense-tracker/BottomNavigation";
import AddExpenseModal from "../components/expense-tracker/AddExpenseModal";
import { useTheme } from "../context/ThemeContext";
import { themeColors } from "../constants/theme";
import { useRouter } from "expo-router";
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

// Define card type
interface Card {
  id: number;
  name: string;
  number: string;
  expiryDate: string;
  balance: number;
  gradientColors: [string, string, string];
}

// Sample data
const cards: Card[] = [
  {
    id: 1,
    name: "Main Card",
    number: "•••• •••• •••• 4567",
    expiryDate: "12/25",
    balance: 3254.8,
    gradientColors: ["#6366F1", "#8B5CF6", "#D946EF"],
  },
  {
    id: 2,
    name: "Savings Card",
    number: "•••• •••• •••• 8901",
    expiryDate: "09/24",
    balance: 12750.5,
    gradientColors: ["#10B981", "#059669", "#047857"],
  },
];

const recentTransactions: Transaction[] = [
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
    title: "Netflix Subscription",
    amount: 12.99,
    category: "Entertainment",
    date: "Mar 3",
    type: "expense",
  },
  {
    id: 3,
    title: "Gas Station",
    amount: 35.4,
    category: "Transport",
    date: "Mar 2",
    type: "expense",
  },
];

export default function CardsScreen() {
  const { isDark, theme } = useTheme();
  const { width } = Dimensions.get("window");
  const cardWidth = width > 500 ? 400 : width - 32;
  const router = useRouter();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  // Handle tab navigation
  const handleTabChange = (tab: string) => {
    if (tab === "dashboard") {
      router.push("/");
    } else if (tab !== "cards") {
      router.push(tab === "activity" ? "/activity" : "/calendar");
    }
  };

  return (
    <ScreenTransition>
      <ThemedView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <Header
          title="Cards"
          rightIcon={<Plus size={20} color={theme.text} strokeWidth={2} />}
          onRightPress={() => setShowAddCard(true)}
          hideThemeToggle
        />

        <ScreenContainer scrollable={false}>
          {/* Cards Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
            snapToInterval={cardWidth + 16}
            decelerationRate="fast"
            style={styles.cardsScroll}
          >
            {cards.map((card) => (
              <LinearGradient
                key={card.id}
                colors={card.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, { width: cardWidth }]}
              >
                <View style={styles.cardHeader}>
                  <ThemedText style={styles.cardName}>{card.name}</ThemedText>
                  <CreditCard size={24} color="#FFFFFF" />
                </View>
                <ThemedText style={styles.cardNumber}>{card.number}</ThemedText>
                <View style={styles.cardFooter}>
                  <View>
                    <ThemedText style={styles.cardLabel}>
                      Expiry Date
                    </ThemedText>
                    <ThemedText style={styles.cardExpiry}>
                      {card.expiryDate}
                    </ThemedText>
                  </View>
                  <View>
                    <ThemedText style={styles.cardLabel}>Balance</ThemedText>
                    <ThemedText style={styles.cardBalance}>
                      $
                      {card.balance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </ThemedText>
                  </View>
                </View>
              </LinearGradient>
            ))}
          </ScrollView>

          {/* Card Actions */}
          <View
            style={[
              styles.actionsContainer,
              { backgroundColor: theme.surface },
            ]}
          >
            <TouchableOpacity style={styles.actionButton}>
              <ThemedText style={[styles.actionText, { color: theme.text }]}>
                View Details
              </ThemedText>
              <ChevronRight size={16} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <ThemedText style={[styles.actionText, { color: theme.text }]}>
                Manage Card
              </ThemedText>
              <ChevronRight size={16} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <ThemedText style={[styles.actionText, { color: theme.text }]}>
                Card Settings
              </ThemedText>
              <ChevronRight size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
                Recent Transactions
              </ThemedText>
              <TouchableOpacity>
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
              bottom: 100,
            },
          ]}
        >
          <Plus size={24} color={theme.background} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Bottom Navigation */}
        <BottomNavigation activeTab="cards" setActiveTab={handleTabChange} />
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
  cardsScroll: {
    marginTop: 16,
  },
  cardsContainer: {
    paddingHorizontal: CONTENT_PADDING,
    paddingBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  cardName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  cardNumber: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "500",
    letterSpacing: 2,
    marginBottom: 24,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginBottom: 4,
  },
  cardExpiry: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  cardBalance: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  actionsContainer: {
    borderRadius: 12,
    marginHorizontal: CONTENT_PADDING,
    marginTop: 16,
    overflow: "hidden",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  transactionsSection: {
    marginTop: CARD_MARGIN * 2,
    marginHorizontal: CONTENT_PADDING,
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
});
