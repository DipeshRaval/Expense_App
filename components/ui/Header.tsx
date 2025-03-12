import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, ViewStyle } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  hideThemeToggle?: boolean;
}

// Memoized theme toggle button component
const ThemeToggle = React.memo(() => {
  const { theme, isDark, toggleTheme } = useTheme();

  const iconStyle = useMemo(() => [
    styles.iconButton,
    { backgroundColor: theme.inputBackground }
  ], [theme.inputBackground]);

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={iconStyle}
    >
      {isDark ? (
        <Sun size={20} color={theme.text} strokeWidth={2.5} />
      ) : (
        <Moon size={20} color={theme.text} strokeWidth={2.5} />
      )}
    </TouchableOpacity>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

// Memoized right icon button component
const RightIconButton = React.memo(({ icon, onPress, theme }: {
  icon: React.ReactNode;
  onPress?: () => void;
  theme: any;
}) => {
  const buttonStyle = useMemo(() => [
    styles.iconButton,
    { backgroundColor: theme.inputBackground }
  ], [theme.inputBackground]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={buttonStyle}
    >
      {icon}
    </TouchableOpacity>
  );
});

RightIconButton.displayName = 'RightIconButton';

const Header: React.FC<HeaderProps> = React.memo(({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  hideThemeToggle = false,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const headerStyle = useMemo(() => [
    styles.header,
    {
      paddingTop: Math.max(insets.top, 12),
      backgroundColor: theme.background,
      borderBottomColor: theme.divider,
      borderBottomWidth: 1,
    }
  ], [insets.top, theme.background, theme.divider]);

  const titleStyle = useMemo(() => [
    styles.title, 
    { color: theme.text }
  ], [theme.text]);

  const leftButtonStyle = useMemo(() => [
    styles.iconButton,
    { backgroundColor: theme.inputBackground }
  ], [theme.inputBackground]);

  return (
    <ThemedView style={headerStyle}>
      <View style={styles.headerContent}>
        {/* Left Icon or Placeholder */}
        <View style={styles.iconContainer}>
          {leftIcon ? (
            <TouchableOpacity
              onPress={onLeftPress}
              style={leftButtonStyle}
            >
              {leftIcon}
            </TouchableOpacity>
          ) : <View style={styles.iconPlaceholder} />}
        </View>
        
        {/* Title Container */}
        <View style={styles.titleContainer}>
          <ThemedText style={titleStyle} numberOfLines={1}>
            {title}
          </ThemedText>
        </View>

        {/* Right Icon or Theme Toggle */}
        <View style={styles.iconContainer}>
          {!hideThemeToggle ? (
            <ThemeToggle />
          ) : rightIcon ? (
            <RightIconButton icon={rightIcon} onPress={onRightPress} theme={theme} />
          ) : <View style={styles.iconPlaceholder} />}
        </View>
      </View>
    </ThemedView>
  );
});

Header.displayName = 'Header';

const styles = StyleSheet.create({
  header: {
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Header; 