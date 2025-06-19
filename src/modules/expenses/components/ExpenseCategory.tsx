import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

interface ExpenseCategoryProps {
  category: string;
  amount: number;
  maxAmount: number;
  onPress: () => void;
}

const {width: screenWidth} = Dimensions.get('window');

export const ExpenseCategory: React.FC<ExpenseCategoryProps> = ({
  category,
  amount,
  maxAmount,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const positionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Анимация появления
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    // Анимация позиции в зависимости от суммы
    const normalizedPosition = (amount / maxAmount) * 100;
    Animated.spring(positionAnim, {
      toValue: normalizedPosition,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [amount, maxAmount]);

  // Вычисляем размер звезды в зависимости от суммы
  const size = Math.max(60, Math.min(100, (amount / maxAmount) * 100));
  
  // Вычисляем позицию по горизонтали (случайную, но стабильную для категории)
  const hashCode = category.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const horizontalPosition = Math.abs(hashCode % (screenWidth - size - 40)) + 20;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {scale: scaleAnim},
            {translateY: positionAnim.interpolate({
              inputRange: [0, 100],
              outputRange: [300, 0],
            })},
          ],
          left: horizontalPosition,
        },
      ]}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.star,
          {
            width: size,
            height: size,
          },
        ]}>
        <View style={styles.starContent}>
          <Text style={styles.amount}>${amount}</Text>
          <Text style={styles.category} numberOfLines={1}>
            {category}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00e6d6',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  starContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 230, 214, 0.5)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
  category: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
    textShadowColor: 'rgba(0, 230, 214, 0.5)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
}); 