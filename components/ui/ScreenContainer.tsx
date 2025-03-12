import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { themeColors } from '../../constants/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_PADDING = SCREEN_WIDTH > 500 ? 24 : 16;

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
}) => {
  const { isDark } = useTheme();
  const theme = themeColors[isDark ? 'dark' : 'light'];

  const Container = scrollable ? ScrollView : View;

  return (
    <SafeAreaView 
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
      ]}
      edges={['left', 'right']}
    >
      <Container
        style={[styles.container, style]}
        contentContainerStyle={[
          scrollable && styles.scrollContent,
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: CONTENT_PADDING,
  },
});

export default React.memo(ScreenContainer); 