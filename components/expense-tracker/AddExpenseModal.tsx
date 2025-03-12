import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  StyleSheet,
  Platform,
  Pressable,
  Dimensions,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  LayoutAnimation,
  UIManager,
  NativeModules,
  PanResponder
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useTheme } from '../../context/ThemeContext';
import { themeColors } from '../../constants/theme';
import { X, Calendar, Tag, CreditCard, Check } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AddExpenseModalProps {
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'food', label: 'Food & Drinks', icon: '🍔', color: '#F97316' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#3B82F6' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#EC4899' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#8B5CF6' },
  { id: 'utilities', label: 'Utilities', icon: '💡', color: '#10B981' },
  { id: 'health', label: 'Health', icon: '💊', color: '#EF4444' },
  { id: 'education', label: 'Education', icon: '📚', color: '#6366F1' },
  { id: 'travel', label: 'Travel', icon: '✈️', color: '#0EA5E9' },
  { id: 'other', label: 'Other', icon: '📦', color: '#71717A' },
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONTENT_PADDING = SCREEN_WIDTH > 500 ? 24 : 16;

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onClose }) => {
  const [expenseType, setExpenseType] = useState<'expense' | 'income'>('expense');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const { theme, isDark } = useTheme();
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const panY = useRef(new Animated.Value(0)).current;
  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  });

  const closeAnim = Animated.timing(panY, {
    toValue: SCREEN_HEIGHT,
    duration: 200,
    useNativeDriver: true,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical gestures
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // If dragged down more than 100 units, close the modal
          closeAnim.start(onClose);
        } else {
          // Otherwise, reset to initial position
          resetPositionAnim.start();
        }
      },
    })
  ).current;

  const translateY = panY.interpolate({
    inputRange: [0, SCREEN_HEIGHT],
    outputRange: [0, SCREEN_HEIGHT],
    extrapolate: 'clamp',
  });

  // Handle keyboard appearance
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Animate the modal sliding up when it mounts
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      mass: 1,
      stiffness: 100,
    }).start();
  }, []);

  // Animate the modal sliding down when closing
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [onClose]);

  const handleDateChange = useCallback((event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSelectedDate(date);
    }
  }, []);

  // Get the appropriate color for the amount based on transaction type
  const getAmountColor = useCallback(() => {
    if (!amount) return theme.textSecondary;
    return expenseType === 'expense' ? theme.error : theme.success;
  }, [amount, expenseType, theme]);

  // Format date to a more readable format
  const formatDate = useCallback((date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }, []);

  const isFormValid = useMemo(() => 
    amount && selectedCategory && title,
    [amount, selectedCategory, title]
  );

  const modalContainerStyle = useMemo(() => [
    styles.modalContainer,
    { transform: [{ translateY: slideAnim }] }
  ], [slideAnim]);

  const contentContainerStyle = useMemo(() => [
    styles.scrollContent,
    { paddingBottom: 120 } // Fixed padding to ensure content is scrollable above the button
  ], []);

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={true}
      onRequestClose={handleClose}
    >
      <BlurView 
        intensity={Platform.OS === 'ios' ? 25 : 100}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
          <TouchableOpacity 
            style={styles.dismissArea} 
            activeOpacity={1} 
            onPress={handleClose}
          />
          
          <Animated.View 
            style={[
              modalContainerStyle,
              { transform: [{ translateY }] }
            ]}
          >
            <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
              <View {...panResponder.panHandlers}>
              <View style={styles.dragIndicator} />
              
              <View style={styles.header}>
                <ThemedText style={[styles.title, { color: theme.text }]}>
                  Add Transaction
                </ThemedText>
                <TouchableOpacity 
                  onPress={handleClose}
                    style={[styles.headerButton, { backgroundColor: theme.surface }]}
                >
                  <X size={20} color={theme.textSecondary} />
                </TouchableOpacity>
                </View>
              </View>
              
              <ScrollView 
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={contentContainerStyle}
                keyboardShouldPersistTaps="handled"
                bounces={false}
              >
                {/* Type Selector */}
                <View style={[styles.typeSelector, { backgroundColor: theme.surface }]}>
                  {['expense', 'income'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        expenseType === type && [
                          styles.activeTypeButton,
                          { 
                            backgroundColor: theme.background,
                            borderColor: type === 'expense' ? theme.error : theme.success,
                          }
                        ]
                      ]}
                      onPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setExpenseType(type as 'expense' | 'income');
                      }}
                    >
                      <ThemedText style={[
                        styles.typeButtonText,
                        { 
                          color: expenseType === type 
                            ? type === 'expense' ? theme.error : theme.success
                            : theme.textSecondary 
                        }
                      ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Amount Input */}
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                    Amount
                  </ThemedText>
                  <View style={[
                    styles.inputWithIcon, 
                    { 
                      backgroundColor: theme.inputBackground,
                      borderColor: amount ? (expenseType === 'expense' ? theme.error : theme.success) : 'transparent',
                      borderWidth: 1
                    }
                  ]}>
                    <CreditCard 
                      size={18} 
                      color={amount ? (expenseType === 'expense' ? theme.error : theme.success) : theme.textSecondary} 
                      style={styles.inputIconSvg}
                    />
                    <TextInput
                      style={[
                        styles.input, 
                        { 
                          color: getAmountColor(),
                          fontSize: amount ? 24 : 18
                        }
                      ]}
                      placeholder="0.00"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="decimal-pad"
                      value={amount}
                      onChangeText={setAmount}
                    />
                  </View>
                </View>

                {/* Category Selector */}
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                    Category
                  </ThemedText>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                  >
                    {CATEGORIES.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryButton,
                          selectedCategory === category.id && {
                            backgroundColor: `${category.color}20`,
                            borderColor: category.color,
                          }
                        ]}
                        onPress={() => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          setSelectedCategory(category.id);
                        }}
                      >
                        <View style={styles.categoryIcon}>
                          <ThemedText style={styles.categoryEmoji}>
                            {category.icon}
                          </ThemedText>
                        </View>
                        <ThemedText 
                          style={[
                            styles.categoryLabel,
                            { color: selectedCategory === category.id ? category.color : theme.textSecondary }
                          ]}
                        >
                          {category.label}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Title Input */}
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                    Title
                  </ThemedText>
                  <View style={[
                    styles.inputWithIcon,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: title ? theme.primary : 'transparent',
                      borderWidth: 1
                    }
                  ]}>
                    <Tag 
                      size={18} 
                      color={title ? theme.primary : theme.textSecondary} 
                      style={styles.inputIconSvg}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        { color: theme.text }
                      ]}
                      placeholder="What was this for?"
                      placeholderTextColor={theme.textSecondary}
                      value={title}
                      onChangeText={setTitle}
                    />
                  </View>
                </View>

                {/* Date Selector */}
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                    Date
                  </ThemedText>
                  <TouchableOpacity
                    style={[
                      styles.inputWithIcon,
                      { backgroundColor: theme.inputBackground }
                    ]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Calendar 
                      size={18} 
                      color={theme.textSecondary} 
                      style={styles.inputIconSvg}
                    />
                    <ThemedText style={[styles.dateText, { color: theme.text }]}>
                      {formatDate(selectedDate)}
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Note Input */}
                <View style={styles.formGroup}>
                  <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                    Note (Optional)
                  </ThemedText>
                  <View style={[
                    styles.noteInput,
                    { backgroundColor: theme.inputBackground }
                  ]}>
                    <TextInput
                      style={[
                        styles.input,
                        { color: theme.text }
                      ]}
                      placeholder="Add a note..."
                      placeholderTextColor={theme.textSecondary}
                      multiline
                      numberOfLines={3}
                      value={note}
                      onChangeText={setNote}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={[
                styles.footer,
                { backgroundColor: theme.background }
              ]}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    !isFormValid && styles.disabledButton,
                    { backgroundColor: theme.primary }
                  ]}
                  onPress={handleClose}
                  disabled={!isFormValid}
                >
                  <Check size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <ThemedText style={styles.saveButtonText}>
                    Save Transaction
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {showDatePicker && Platform.OS === 'ios' && (
                <View style={[styles.datePickerContainer, { backgroundColor: theme.surface }]}>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    textColor={theme.text}
                  />
                  <TouchableOpacity
                    style={[styles.datePickerButton, { backgroundColor: theme.primary }]}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <ThemedText style={styles.datePickerButtonText}>
                      Done
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {showDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </ThemedView>
          </Animated.View>
      </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  dismissArea: {
    flex: 1,
  },
  modalContainer: {
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: CONTENT_PADDING,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContent: {
    padding: CONTENT_PADDING,
  },
  typeSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTypeButton: {
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIconSvg: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  noteInput: {
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: CONTENT_PADDING,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  saveButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerContainer: {
    padding: CONTENT_PADDING,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  datePickerButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  datePickerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default React.memo(AddExpenseModal);