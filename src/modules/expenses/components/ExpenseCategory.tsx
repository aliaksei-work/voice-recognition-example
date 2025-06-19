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
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Анимация появления
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    // Анимация свечения
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.7,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Вычисляем размер звезды в зависимости от суммы
  const size = Math.max(40, (amount / maxAmount) * 80);
  
  // Случайное, но стабильное положение для каждой категории
  const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const left = (hash % (screenWidth - size - 32)) + 16;
  const top = ((hash * 13) % 200) + 16;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, {left, top}]}>
      <Animated.View
        style={[
          styles.star,
          {
            width: size,
            height: size,
            transform: [{scale: scaleAnim}],
            opacity: glowAnim,
          },
        ]}>
        <View style={styles.content}>
          <Text style={styles.amount}>{Math.round(amount)} ₽</Text>
          <Text style={styles.category} numberOfLines={1}>
            {category}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1,
  },
  star: {
    backgroundColor: '#00e6d6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00e6d6',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  content: {
    alignItems: 'center',
  },
  amount: {
    color: '#004953',
    fontSize: 12,
    fontWeight: 'bold',
  },
  category: {
    color: '#004953',
    fontSize: 10,
    maxWidth: 60,
  },
}); 