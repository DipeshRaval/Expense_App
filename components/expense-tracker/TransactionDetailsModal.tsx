import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Dimensions,
} from "react-native";
import {
  X,
  Calendar,
  Tag,
  DollarSign,
  Type,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  FileText,
  Check,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ThemedText } from "../ThemedText";
import { useTheme } from "../../context/ThemeContext";
import { themeColors } from "../../constants/theme";

interface Transaction {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: "expense" | "income";
  notes?: string;
}

// Available categories (matching AddExpenseModal)
const CATEGORIES = {
  expense: [
    { id: "food", label: "Food & Drinks", icon: "🍔", color: "#F97316" },
    { id: "transport", label: "Transport", icon: "🚗", color: "#3B82F6" },
    { id: "shopping", label: "Shopping", icon: "🛍️", color: "#EC4899" },
    {
      id: "entertainment",
      label: "Entertainment",
      icon: "🎬",
      color: "#8B5CF6",
    },
    { id: "utilities", label: "Utilities", icon: "💡", color: "#10B981" },
    { id: "health", label: "Health", icon: "💊", color: "#EF4444" },
    { id: "education", label: "Education", icon: "📚", color: "#6366F1" },
    { id: "travel", label: "Travel", icon: "✈️", color: "#0EA5E9" },
    { id: "other", label: "Other", icon: "📦", color: "#71717A" },
  ],
  income: [
    { id: "salary", label: "Salary", icon: "💰", color: "#10B981" },
    { id: "freelance", label: "Freelance", icon: "💻", color: "#6366F1" },
    { id: "investment", label: "Investment", icon: "📈", color: "#F97316" },
    { id: "business", label: "Business", icon: "🏢", color: "#8B5CF6" },
    { id: "other", label: "Other", icon: "📦", color: "#71717A" },
  ],
};

interface TransactionDetailsModalProps {
  transaction: Transaction;
  visible: boolean;
  onClose: () => void;
  onUpdate: (updatedTransaction: Transaction) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MODAL_PADDING = SCREEN_WIDTH > 500 ? 24 : 16;

export default function TransactionDetailsModal({
  transaction,
  visible,
  onClose,
  onUpdate,
}: TransactionDetailsModalProps) {
  const { isDark } = useTheme();
  const theme = themeColors[isDark ? "dark" : "light"];

  // Add refs for auto-focus
  const titleInputRef = useRef<TextInput>(null);
  const notesInputRef = useRef<TextInput>(null);

  const [editedTransaction, setEditedTransaction] = useState<Transaction>({
    ...transaction,
    notes: transaction.notes || "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Handle edit mode start
  const startEditing = () => {
    setIsEditing(true);
    // Auto focus title input after a short delay to ensure the keyboard shows up
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
  };

  const handleSave = () => {
    onUpdate(editedTransaction);
    setIsEditing(false);
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEditedTransaction({
        ...editedTransaction,
        date: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>
              Transaction Details
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Amount Section */}
            <View
              style={[
                styles.amountSection,
                { backgroundColor: theme.background },
              ]}
            >
              <View style={styles.amountHeader}>
                {editedTransaction.type === "income" ? (
                  <ArrowUpRight size={24} color={theme.success} />
                ) : (
                  <ArrowDownRight size={24} color={theme.error} />
                )}
                {isEditing ? (
                  <TextInput
                    style={[styles.amountInput, { color: theme.text }]}
                    value={editedTransaction.amount.toString()}
                    onChangeText={(text) =>
                      setEditedTransaction({
                        ...editedTransaction,
                        amount: parseFloat(text) || 0,
                      })
                    }
                    keyboardType="numeric"
                    placeholder="Enter amount"
                    placeholderTextColor={theme.textSecondary}
                  />
                ) : (
                  <ThemedText
                    style={[
                      styles.amount,
                      {
                        color:
                          editedTransaction.type === "income"
                            ? theme.success
                            : theme.error,
                      },
                    ]}
                  >
                    {formatAmount(editedTransaction.amount)}
                  </ThemedText>
                )}
              </View>
            </View>

            {/* Details Section */}
            <View
              style={[
                styles.detailsSection,
                { backgroundColor: theme.background },
              ]}
            >
              {/* Title Row */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Type size={20} color={theme.textSecondary} />
                </View>
                {isEditing ? (
                  <TextInput
                    ref={titleInputRef}
                    style={[styles.input, { color: theme.text }]}
                    value={editedTransaction.title}
                    onChangeText={(text) =>
                      setEditedTransaction({
                        ...editedTransaction,
                        title: text,
                      })
                    }
                    placeholder="Title"
                    placeholderTextColor={theme.textSecondary}
                    returnKeyType="next"
                    onSubmitEditing={() => notesInputRef.current?.focus()}
                    autoFocus={true}
                  />
                ) : (
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Title</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {editedTransaction.title}
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Category Row */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Tag size={20} color={theme.textSecondary} />
                </View>
                {isEditing ? (
                  <TouchableOpacity
                    style={[styles.pickerButton, { borderColor: theme.border }]}
                    onPress={() => setShowCategoryPicker(true)}
                  >
                    <ThemedText style={styles.pickerButtonText}>
                      {editedTransaction.category}
                    </ThemedText>
                    <ChevronDown size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Category</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {editedTransaction.category}
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Date Row */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Calendar size={20} color={theme.textSecondary} />
                </View>
                {isEditing ? (
                  <TouchableOpacity
                    style={[styles.pickerButton, { borderColor: theme.border }]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <ThemedText style={styles.pickerButtonText}>
                      {new Date(editedTransaction.date).toLocaleDateString()}
                    </ThemedText>
                    <ChevronDown size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Date</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {new Date(editedTransaction.date).toLocaleDateString()}
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Notes Row */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <FileText size={20} color={theme.textSecondary} />
                </View>
                {isEditing ? (
                  <TextInput
                    ref={notesInputRef}
                    style={[
                      styles.input,
                      styles.notesInput,
                      { color: theme.text, borderColor: theme.border },
                    ]}
                    value={editedTransaction.notes}
                    onChangeText={(text) =>
                      setEditedTransaction({
                        ...editedTransaction,
                        notes: text,
                      })
                    }
                    placeholder="Add notes..."
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                ) : (
                  <View style={styles.detailContent}>
                    <ThemedText style={styles.detailLabel}>Notes</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {editedTransaction.notes || "No notes added"}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Category Picker Modal */}
          <Modal
            visible={showCategoryPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowCategoryPicker(false)}
          >
            <View
              style={[
                styles.pickerModal,
                { backgroundColor: "rgba(0,0,0,0.5)" },
              ]}
            >
              <View
                style={[
                  styles.pickerContent,
                  { backgroundColor: theme.surface },
                ]}
              >
                <View style={styles.pickerHeader}>
                  <ThemedText style={styles.pickerTitle}>
                    Select Category
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => setShowCategoryPicker(false)}
                    style={styles.closeButton}
                  >
                    <X size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.categoryList}>
                  {CATEGORIES[editedTransaction.type].map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryItem,
                        {
                          backgroundColor:
                            category.id === editedTransaction.category
                              ? `${theme.primary}20`
                              : "transparent",
                        },
                      ]}
                      onPress={() => {
                        setEditedTransaction({
                          ...editedTransaction,
                          category: category.id,
                        });
                        setShowCategoryPicker(false);
                      }}
                    >
                      <View style={styles.categoryItemContent}>
                        <ThemedText style={styles.categoryIcon}>
                          {category.icon}
                        </ThemedText>
                        <View style={styles.categoryTextContainer}>
                          <ThemedText
                            style={[
                              styles.categoryText,
                              {
                                color:
                                  category.id === editedTransaction.category
                                    ? theme.primary
                                    : theme.text,
                              },
                            ]}
                          >
                            {category.label}
                          </ThemedText>
                        </View>
                        {category.id === editedTransaction.category && (
                          <View style={styles.checkmarkContainer}>
                            <Check size={20} color={theme.primary} />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={new Date(editedTransaction.date)}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { borderColor: theme.border },
                  ]}
                  onPress={() => {
                    setEditedTransaction({ ...transaction });
                    setIsEditing(false);
                  }}
                >
                  <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={handleSave}
                >
                  <ThemedText style={[styles.buttonText, { color: "#FFFFFF" }]}>
                    Save Changes
                  </ThemedText>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.editButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={startEditing}
              >
                <ThemedText style={[styles.buttonText, { color: "#FFFFFF" }]}>
                  Edit Transaction
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: MODAL_PADDING,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    maxHeight: SCREEN_WIDTH > 500 ? 600 : 500,
  },
  amountSection: {
    padding: MODAL_PADDING,
    marginBottom: 12,
  },
  amountHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amount: {
    fontSize: 30,
    fontWeight: "700",
    paddingTop: 10,
    // marginLeft: 5,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: "700",
    padding: 0,
    flex: 1,
  },
  detailsSection: {
    padding: MODAL_PADDING,
    borderRadius: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    padding: 0,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    padding: MODAL_PADDING,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    flex: 2,
  },
  editButton: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  pickerButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  pickerModal: {
    flex: 1,
    justifyContent: "flex-end",
  },
  pickerContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    maxHeight: "70%",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: MODAL_PADDING,
    paddingBottom: 16,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  categoryList: {
    padding: MODAL_PADDING,
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "500",
  },
  checkmarkContainer: {
    marginLeft: "auto",
    paddingLeft: 8,
  },
  notesInput: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
});
