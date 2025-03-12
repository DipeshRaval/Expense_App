import React, { useCallback, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { PieChart, Activity, Calendar, CreditCard } from 'lucide-react-native';
import { ThemedView } from '../ThemedView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { themeColors } from '../../constants/theme';
import TabIcon from './TabIcon';

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', icon: PieChart, label: 'Dashboard' },
  { id: 'activity', icon: Activity, label: 'Activity' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'cards', icon: CreditCard, label: 'Cards' }
];

const BottomNavigation: React.FC<BottomNavigationProps> = React.memo(({ activeTab, setActiveTab }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleTabPress = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, [setActiveTab]);

  const containerStyle = useMemo(() => [
    styles.container,
    {
      backgroundColor: theme.background,
      paddingBottom: Math.max(insets.bottom, 10),
      borderTopColor: theme.divider,
      borderTopWidth: 1,
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
    }
  ], [theme.background, theme.divider, insets.bottom]);

  return (
    <ThemedView style={containerStyle}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tab}
          onPress={() => handleTabPress(tab.id)}
          activeOpacity={0.7}
        >
          <TabIcon
            Icon={tab.icon}
            label={tab.label}
            isActive={activeTab === tab.id}
          />
        </TouchableOpacity>
      ))}
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: 6,
  },
  tab: {
    flex: 1,
  },
});

BottomNavigation.displayName = 'BottomNavigation';

export default BottomNavigation;