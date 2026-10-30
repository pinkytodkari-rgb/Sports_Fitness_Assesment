import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { colors } from '../../theme';

interface SkillPoint {
  label: string;
  value: number; // 0 - 100
}

interface RadarChartProps {
  data: SkillPoint[];
  comparisonData?: SkillPoint[];
  size?: number;
  primaryColor?: string;
  comparisonColor?: string;
  labelOne?: string;
  labelTwo?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  comparisonData,
  size = 260,
  primaryColor,
  comparisonColor,
  labelOne,
  labelTwo,
}) => {
  const chartPrimary = primaryColor || colors.primary; // #FF5500
  const chartComp = comparisonColor || colors.secondary; // #FFAA00

  const center = size / 2;
  const radius = size * 0.36;
  const numAxes = data.length;
  const angleStep = (2 * Math.PI) / numAxes;

  const getCoordinates = (index: number, val: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (val / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const primaryPoints = data
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.value);
      return `${x},${y}`;
    })
    .join(' ');

  const compPoints = comparisonData
    ? comparisonData
        .map((d, i) => {
          const { x, y } = getCoordinates(i, d.value);
          return `${x},${y}`;
        })
        .join(' ')
    : null;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background Grid Rings */}
        {gridLevels.map((lvl, idx) => {
          const ringPoints = data
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl * 100);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <Polygon
              key={`ring-${idx}`}
              points={ringPoints}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          );
        })}

        {/* Radar Axes Lines */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <Line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          );
        })}

        {/* Comparison Data Shape (if available) */}
        {compPoints && (
          <Polygon
            points={compPoints}
            fill={`${chartComp}25`}
            stroke={chartComp}
            strokeWidth="2.5"
          />
        )}

        {/* Primary Data Shape */}
        <Polygon
          points={primaryPoints}
          fill={`${chartPrimary}20`}
          stroke={chartPrimary}
          strokeWidth="2.5"
        />

        {/* Data Vertices */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(i, d.value);
          return (
            <Circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r="4.5"
              fill={chartPrimary}
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          );
        })}

        {/* Axis Labels */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(i, 118);
          return (
            <SvgText
              key={`label-${i}`}
              x={x}
              y={y}
              fill={colors.textSecondary}
              fontSize="10"
              fontWeight="700"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {d.label} ({d.value})
            </SvgText>
          );
        })}
      </Svg>

      {(labelOne || labelTwo) && (
        <View style={styles.legendContainer}>
          {labelOne && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: chartPrimary }]} />
              <Text style={styles.legendText}>{labelOne}</Text>
            </View>
          )}
          {labelTwo && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: chartComp }]} />
              <Text style={styles.legendText}>{labelTwo}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
