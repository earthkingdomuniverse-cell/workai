import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../src/theme';

interface RatingStarsProps {
  rating: number;
  size?: 'small' | 'medium' | 'large';
  editable?: boolean;
  onChange?: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 'medium',
  editable = false,
  onChange,
}) => {
  const getStarSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'medium':
        return 16;
      case 'large':
        return 20;
      default:
        return 16;
    }
  };

  const starSize = getStarSize();

  const handlePress = (starIndex: number) => {
    if (editable && onChange) {
      onChange(starIndex);
    }
  };

  // Create an array of 5 stars
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= rating;
    const starComponent = (
      <Text key={i} style={[styles.star, { fontSize: starSize }]}>
        {isFilled ? '★' : '☆'}
      </Text>
    );

    if (editable) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => handlePress(i)}>
          {starComponent}
        </TouchableOpacity>,
      );
    } else {
      stars.push(starComponent);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>{stars}</View>
      {!editable && (
        <Text style={[styles.ratingText, { fontSize: starSize * 0.75 }]}>{rating.toFixed(1)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  star: {
    color: colors.warning,
  },
  ratingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
});

export default RatingStars;
