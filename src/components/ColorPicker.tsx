import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  value: string;
  onChange: (color: string) => void;
};

const COLORS = [
  '#ff4757', // Red
  '#2f72ff', // Blue  
  '#2ed573', // Green
  '#ffa502', // Orange
  '#9c88ff', // Purple
  // '#ff6b81', // Pink
  // '#70a1ff', // Light Blue
  // '#7bed9f', // Light Green
  // '#ffb142', // Yellow
  // '#333333', // Dark Gray
  '#ffffff', // White
  '#000000', // Black
];

export default function ColorPicker({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {COLORS.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorButton,
            { backgroundColor: color },
            value === color && styles.selected,
            color === '#ffffff' && styles.whiteButton,
          ]}
          onPress={() => onChange(color)}
          activeOpacity={0.7}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    flex: 1,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginVertical: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#333',
    borderWidth: 3,
  },
  whiteButton: {
    borderColor: '#ddd',
    borderWidth: 1,
  },
});