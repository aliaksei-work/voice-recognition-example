import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {ExpenseCategory} from './ExpenseCategory';

interface CategoryData {
  category: string;
  amount: number;
}

interface ExpenseCategoriesProps {
  expenses: Array<{
    amount: number;
    category: string;
  }>;
  onCategoryPress: (category: string) => void;
}

const {height: screenHeight} = Dimensions.get('window');

export const ExpenseCategories: React.FC<ExpenseCategoriesProps> = ({
  expenses,
  onCategoryPress,
}) => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [maxAmount, setMaxAmount] = useState(0);

  useEffect(() => {
    // Группируем траты по категориям
    const categoryMap = expenses.reduce((acc, expense) => {
      const {category, amount} = expense;
      if (!acc[category]) {
        acc[category] = {category, amount: 0};
      }
      acc[category].amount += amount;
      return acc;
    }, {} as Record<string, CategoryData>);

    // Преобразуем в массив и сортируем по сумме
    const sortedCategories = Object.values(categoryMap).sort(
      (a, b) => b.amount - a.amount,
    );

    // Находим максимальную сумму для масштабирования
    const maxCategoryAmount = sortedCategories.length
      ? sortedCategories[0].amount
      : 0;

    setCategories(sortedCategories);
    setMaxAmount(maxCategoryAmount);
  }, [expenses]);

  return (
    <View style={styles.container}>
      {categories.map((categoryData, index) => (
        <ExpenseCategory
          key={categoryData.category}
          category={categoryData.category}
          amount={categoryData.amount}
          maxAmount={maxAmount}
          onPress={() => onCategoryPress(categoryData.category)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    minHeight: screenHeight * 0.5,
    justifyContent: 'flex-start',
  },
}); 