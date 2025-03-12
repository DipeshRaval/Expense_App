import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { ModalProvider } from '../context/ModalContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, Platform } from 'react-native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

// Custom animation configurations
const tabScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: Platform.select({
    ios: 'simple_push',
    android: 'fade_from_bottom',
  }),
  animationDuration: 70,
  contentStyle: {
    backgroundColor: 'transparent',
  },
};

const modalScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_bottom',
  animationDuration: 200,
  contentStyle: {
    backgroundColor: 'transparent',
  },
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <ModalProvider>
          <Stack>
            <Stack.Screen 
              name="index"
              options={tabScreenOptions}
            />
            <Stack.Screen 
              name="activity"
              options={tabScreenOptions}
            />
            <Stack.Screen 
              name="calendar"
              options={tabScreenOptions}
            />
            <Stack.Screen 
              name="cards"
              options={tabScreenOptions}
            />
          </Stack>
        </ModalProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

// Use memo to prevent unnecessary re-renders
export default React.memo(RootLayoutContent);