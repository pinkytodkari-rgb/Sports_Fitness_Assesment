import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { borderRadius } from '../../theme';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadiusValue?: number;
  style?: ViewStyle;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadiusValue = borderRadius.sm,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius: borderRadiusValue },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
});
