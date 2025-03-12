import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleSheet, Dimensions } from 'react-native';

interface TabTransitionProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TabTransition: React.FC<TabTransitionProps> = ({ children, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH * 0.1)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Cleanup animation values when component unmounts
    return () => {
      fadeAnim.setValue(0);
      translateX.setValue(SCREEN_WIDTH * 0.1);
      scale.setValue(0.95);
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: fadeAnim,
          transform: [
            { translateX },
            { scale }
          ],
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

export default React.memo(TabTransition); 