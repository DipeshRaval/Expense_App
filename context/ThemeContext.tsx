import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useLayoutEffect, useRef } from 'react';
import { useColorScheme, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themeColors } from '../constants/theme';

type ThemeType = 'light' | 'dark' | null;
type ThemeColors = typeof themeColors.light & typeof themeColors.dark;

interface ThemeContextType {
  forcedTheme: ThemeType;
  colorScheme: 'light' | 'dark';
  isDark: boolean;
  toggleTheme: () => void;
  theme: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'forcedTheme';

// Pre-compute theme objects to avoid recreation
const LIGHT_THEME = Object.freeze(themeColors.light) as ThemeColors;
const DARK_THEME = Object.freeze(themeColors.dark) as ThemeColors;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme() ?? 'light';
  const [forcedTheme, setForcedTheme] = useState<ThemeType>(null);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  
  // Use refs to store pre-loaded next themes
  const nextLightTheme = useRef(LIGHT_THEME);
  const nextDarkTheme = useRef(DARK_THEME);

  // Load saved theme preference
  useLayoutEffect(() => {
    let isMounted = true;
    
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && isMounted) {
          setForcedTheme(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        if (isMounted) {
          setIsThemeLoaded(true);
        }
      }
    };
    
    loadTheme();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = forcedTheme === null
      ? systemColorScheme === 'light' ? 'dark' : 'light'
      : forcedTheme === 'light' ? 'dark' : 'light';

    // Apply theme change immediately
    setForcedTheme(newTheme);
    
    // Save theme preference in the background without awaiting
    if (Platform.OS !== 'web') {
      requestAnimationFrame(() => {
        AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme).catch(error => {
          console.error('Error saving theme:', error);
        });
      });
    } else {
      AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme).catch(error => {
        console.error('Error saving theme:', error);
      });
    }
  }, [forcedTheme, systemColorScheme]);

  const colorScheme = forcedTheme ?? systemColorScheme;
  const isDark = colorScheme === 'dark';
  
  // Use pre-computed theme objects
  const theme = useMemo(() => isDark ? nextDarkTheme.current : nextLightTheme.current, [isDark]);

  // Pre-load the opposite theme for faster switching
  useEffect(() => {
    if (Platform.OS !== 'web') {
      requestAnimationFrame(() => {
        nextLightTheme.current = LIGHT_THEME;
        nextDarkTheme.current = DARK_THEME;
      });
    }
  }, [isDark]);

  const value = useMemo(() => ({
    forcedTheme,
    colorScheme,
    isDark,
    toggleTheme,
    theme,
  }), [forcedTheme, colorScheme, isDark, toggleTheme, theme]);

  if (!isThemeLoaded) {
    // Return a placeholder or loading state if needed
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 