import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleSheet } from 'react-native';
import { useModal } from '../../context/ModalContext';

interface ScreenTransitionProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const ScreenTransition: React.FC<ScreenTransitionProps> = ({ children, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const { showAddExpense } = useModal();

  useEffect(() => {
    // Only animate if modal is not showing
    if (!showAddExpense) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showAddExpense]);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default React.memo(ScreenTransition); 