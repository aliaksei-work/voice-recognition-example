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
        acc[category] = 0;
      }
      acc[category] += amount;
      return acc;
    }, {} as Record<string, number>);

    // Преобразуем в массив и сортируем по сумме
    const sortedCategories = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Находим максимальную сумму
    const max = sortedCategories.length > 0 ? sortedCategories[0].amount : 0;

    setCategories(sortedCategories);
    setMaxAmount(max);
  }, [expenses]);

  return (
    <View style={styles.container}>
      {categories.map((categoryData) => (
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
    backgroundColor: '#004953',
    width: '100%',
    height: '100%',
  },
}); 