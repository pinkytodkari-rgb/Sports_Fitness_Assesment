import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, LinearGradient as SvgGradient, Stop, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../../theme';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  gradientFrom?: string;
  unit?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 320,
  height = 180,
  color,
  gradientFrom,
  unit = '',
}) => {
  if (!data || data.length === 0) return null;

  const chartColor = color && color !== '#00F2FE' ? color : colors.accent;
  const gradientColor = gradientFrom && gradientFrom !== '#00F2FE' ? gradientFrom : colors.accent;

  const paddingHorizontal = 30;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = width - paddingHorizontal * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values) * 0.9;
  const maxVal = Math.max(...values) * 1.1;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingHorizontal + chartWidth / 2;
    return paddingHorizontal + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    return paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
  };

  // Build SVG Path d string
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`);
  const linePathD = `M ${points.join(' L ')}`;

  const fillPathD = `${linePathD} L ${getX(data.length - 1)},${paddingTop + chartHeight} L ${getX(
    0
  )},${paddingTop + chartHeight} Z`;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <SvgGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={gradientColor} stopOpacity="0.25" />
          <Stop offset="100%" stopColor={gradientColor} stopOpacity="0.0" />
        </SvgGradient>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const yPos = paddingTop + chartHeight * ratio;
          return (
            <Line
              key={`grid-${i}`}
              x1={paddingHorizontal}
              y1={yPos}
              x2={width - paddingHorizontal}
              y2={yPos}
              stroke="#E5E7EB"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Gradient Fill under path */}
        <Path d={fillPathD} fill="url(#lineGrad)" />

        {/* Line */}
        <Path d={linePathD} fill="none" stroke={chartColor} strokeWidth="3" strokeLinecap="round" />

        {/* Data points & labels */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.value);
          return (
            <React.Fragment key={`pt-${i}`}>
              <Circle cx={cx} cy={cy} r="4.5" fill={chartColor} stroke="#FFFFFF" strokeWidth="2" />
              <SvgText
                x={cx}
                y={height - 8}
                fill={colors.textSecondary}
                fontSize="10"
                fontWeight="500"
                textAnchor="middle"
              >
                {d.label}
              </SvgText>
              <SvgText
                x={cx}
                y={cy - 9}
                fill={colors.textPrimary}
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                {d.value}
                {unit}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
