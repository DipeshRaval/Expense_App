import React, { useEffect, useRef } from 'react';
import { View, Dimensions, StyleSheet, Animated } from 'react-native';
import Svg, { G, Path, Text, Circle } from 'react-native-svg';
import { ThemedText } from '../ThemedText';
import { useTheme } from '../../context/ThemeContext';
import { themeColors } from '../../constants/theme';

interface ExpenseCategoryChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_SIZE = SCREEN_WIDTH - 64;
const RADIUS = CHART_SIZE * 0.38; // Slightly larger radius
const CENTER_X = CHART_SIZE / 2;
const CENTER_Y = CHART_SIZE / 2;
const CENTER_CIRCLE_RADIUS = RADIUS * 0.35; // Larger center circle

const ExpenseCategoryChart: React.FC<ExpenseCategoryChartProps> = ({ data }) => {
  const { isDark } = useTheme();
  const theme = themeColors[isDark ? 'dark' : 'light'];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const centerFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // First animate the pie chart
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Then animate the center total
      Animated.timing(centerFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calculate total value and percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentages = data.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1)
  }));

  // Sort data by value in descending order
  const sortedData = [...dataWithPercentages].sort((a, b) => b.value - a.value);

  // Calculate pie segments
  const createPieSegments = () => {
    let startAngle = 0;
    return sortedData.map((item, index) => {
      const percentage = parseFloat(item.percentage);
      const angle = (percentage / 100) * 360;
      const endAngle = startAngle + angle;
      
      // Calculate path
      const x1 = CENTER_X + RADIUS * Math.cos((startAngle - 90) * Math.PI / 180);
      const y1 = CENTER_Y + RADIUS * Math.sin((startAngle - 90) * Math.PI / 180);
      const x2 = CENTER_X + RADIUS * Math.cos((endAngle - 90) * Math.PI / 180);
      const y2 = CENTER_Y + RADIUS * Math.sin((endAngle - 90) * Math.PI / 180);
      
      // Calculate label position (middle of the segment)
      const labelAngle = startAngle + angle / 2;
      const labelRadius = RADIUS * 0.65; // Adjusted for better visibility
      const labelX = CENTER_X + labelRadius * Math.cos((labelAngle - 90) * Math.PI / 180);
      const labelY = CENTER_Y + labelRadius * Math.sin((labelAngle - 90) * Math.PI / 180);
      
      const path = `
        M ${CENTER_X} ${CENTER_Y}
        L ${x1} ${y1}
        A ${RADIUS} ${RADIUS} 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2}
        Z
      `;
      
      const segment = {
        path,
        color: item.color,
        labelX,
        labelY,
        percentage: item.percentage,
        startAngle,
        endAngle,
      };
      
      startAngle = endAngle;
      return segment;
    });
  };

  const pieSegments = createPieSegments();

  return (
    <View style={styles.container}>
      {sortedData.length > 0 ? (
        <>
          <Animated.View style={[
            styles.chartContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-90deg', '0deg'] // Reduced rotation for smoother animation
                  })
                }
              ]
            }
          ]}>
            <Svg width={CHART_SIZE} height={CHART_SIZE}>
              <G>
                {pieSegments.map((segment, index) => (
                  <React.Fragment key={index}>
                    <Path
                      d={segment.path}
                      fill={segment.color}
                      stroke={theme.background}
                      strokeWidth={2}
                    />
                    <Text
                      x={segment.labelX}
                      y={segment.labelY}
                      fill={isDark ? '#FFFFFF' : '#000000'}
                      fontSize="13"
                      fontWeight="bold"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {segment.percentage}%
                    </Text>
                  </React.Fragment>
                ))}
                
                {/* Larger center circle with shadow */}
                <Circle
                  cx={CENTER_X}
                  cy={CENTER_Y}
                  r={CENTER_CIRCLE_RADIUS + 2}
                  fill={isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}
                />
                <Circle
                  cx={CENTER_X}
                  cy={CENTER_Y}
                  r={CENTER_CIRCLE_RADIUS}
                  fill={theme.background}
                  stroke={theme.divider}
                  strokeWidth={1}
                />
                
                {/* Animated center content */}
                <Animated.View style={{ opacity: centerFadeAnim }}>
                  <Text
                    x={CENTER_X}
                    y={CENTER_Y - 15}
                    fill={theme.text}
                    fontSize="15"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Total
                  </Text>
                  <Text
                    x={CENTER_X}
                    y={CENTER_Y + 15}
                    fill={theme.primary}
                    fontSize="18"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    ${total.toFixed(2)}
                  </Text>
                </Animated.View>
              </G>
            </Svg>
          </Animated.View>

          <View style={styles.legendContainer}>
            {sortedData.map((item, index) => (
              <Animated.View
                key={item.name}
                style={[
                  styles.legendItem,
                  {
                    opacity: fadeAnim,
                    transform: [{
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [15 + index * 5, 0] // Staggered animation
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.legendLeft}>
                  <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                  <ThemedText style={[styles.legendText, { color: theme.text }]}>
                    {item.name}
                  </ThemedText>
                </View>
                <View style={styles.legendRight}>
                  <ThemedText style={[styles.valueText, { color: theme.text }]}>
                    ${item.value.toFixed(2)}
                  </ThemedText>
                  <ThemedText style={[styles.percentageText, { color: theme.textSecondary }]}>
                    {item.percentage}%
                  </ThemedText>
                </View>
              </Animated.View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <ThemedText style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            No expense data available
          </ThemedText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
    height: CHART_SIZE,
  },
  legendContainer: {
    width: '100%',
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '500',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 45,
    textAlign: 'right',
  },
  emptyContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(ExpenseCategoryChart);