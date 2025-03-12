import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useTheme } from '../../context/ThemeContext';
import { themeColors } from '../../constants/theme';

interface CategoryCardProps {
  category: {
    name: string;
    spent: number;
    budget: number;
    color: string;
  };
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { isDark } = useTheme();
  const theme = themeColors[isDark ? 'dark' : 'light'];
  
  const percentage = Math.min(Math.round((category.spent / category.budget) * 100), 100);
  const isOverBudget = category.spent > category.budget;
  
  // Status text and color based on percentage
  let statusText = '';
  let statusColor = '';
  
  if (percentage < 50) {
    statusText = 'On track';
    statusColor = theme.success;
  } else if (percentage < 80) {
    statusText = 'Caution';
    statusColor = '#F59E0B'; // Amber
  } else {
    statusText = isOverBudget ? 'Over budget' : 'Near limit';
    statusColor = theme.error;
  }
  
  return (
    <ThemedView style={[
      styles.container, 
      { backgroundColor: theme.background }
    ]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.colorIndicator, { backgroundColor: category.color }]} />
          <ThemedText style={[styles.title, { color: theme.text }]}>
            {category.name}
          </ThemedText>
        </View>
        <ThemedText style={[styles.values, { color: theme.textSecondary }]}>
          ${category.spent.toFixed(2)} / ${category.budget.toFixed(2)}
        </ThemedText>
      </View>
      
      <View style={[styles.progressContainer, { backgroundColor: theme.surface }]}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${percentage}%`,
              backgroundColor: category.color 
            }
          ]} 
        />
      </View>
      
      <ThemedText style={[styles.status, { color: statusColor }]}>
        {statusText} • {percentage}%
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  values: {
    fontSize: 14,
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  status: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
});

export default CategoryCard;