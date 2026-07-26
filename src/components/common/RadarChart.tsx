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
  const chartPrimary = primaryColor && primaryColor !== '#00F2FE' ? primaryColor : colors.primary; // #0B1F3A
  const chartComp = comparisonColor && comparisonColor !== '#7F00FF' ? comparisonColor : colors.accent; // #2563EB

  const center = size / 2;
  const radius = size * 0.36;
  const numAxes = data.length;
  const angleStep = (2 * Math.PI) / numAxes;

  // Helper to convert polar coordinates to Cartesian
  const getCoordinates = (index: number, val: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (val / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Concentric background grid polygons (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Data polygon points
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
              stroke="#E5E7EB"
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
              stroke="#E5E7EB"
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
          fill={`${chartPrimary}25`}
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
              r="4"
              fill={chartPrimary}
              stroke="#FFFFFF"
              strokeWidth="1.5"
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
              fontWeight="600"
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
