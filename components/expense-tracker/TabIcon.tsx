import React, { useMemo } from 'react';
import { View, StyleSheet, TextStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { ThemedText } from '../ThemedText';
import { useTheme } from '../../context/ThemeContext';

interface TabIconProps {
  Icon: LucideIcon;
  label: string;
  isActive: boolean;
}

const TabIcon: React.FC<TabIconProps> = React.memo(({ Icon, label, isActive }) => {
  const { theme, isDark } = useTheme();

  const iconColor = useMemo(() => 
    isActive 
      ? isDark ? theme.primary : '#5B21B6'
      : theme.textSecondary,
    [isActive, isDark, theme.primary, theme.textSecondary]
  );

  const labelStyle = useMemo((): TextStyle[] => [
    styles.label,
    {
      color: iconColor,
      fontWeight: isActive ? '700' : '500',
      fontSize: 11
    }
  ], [iconColor, isActive]);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon
          size={isActive ? 24 : 20}
          color={iconColor}
          strokeWidth={isActive ? 2.5 : 2}
        />
      </View>
      <ThemedText style={labelStyle}>
        {label}
      </ThemedText>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: {
    marginTop: 0,
    textAlign: 'center',
  },
});

TabIcon.displayName = 'TabIcon';

export default TabIcon; 