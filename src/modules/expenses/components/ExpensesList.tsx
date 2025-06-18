import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Expense } from '../hooks/useExpenses';

interface ExpensesListProps {
  expenses: Expense[];
  onRemoveExpense: (id: string) => void;
}

const ExpenseItem: React.FC<{ expense: Expense; onRemove: (id: string) => void }> = ({
  expense,
  onRemove,
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food':
        return '🍽️';
      case 'transport':
        return '🚗';
      case 'entertainment':
        return '🎬';
      case 'shopping':
        return '🛍️';
      default:
        return '💰';
    }
  };

  return (
    <View style={styles.expenseItem}>
      <View style={styles.expenseContent}>
        <View style={styles.expenseHeader}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(expense.category)}</Text>
          <Text style={styles.category}>{expense.category}</Text>
          <Text style={styles.amount}>{expense.amount.toFixed(2)} €</Text>
        </View>
        <Text style={styles.description}>{expense.description}</Text>
        <Text style={styles.timestamp}>{formatDate(expense.timestamp)}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(expense.id)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

export const ExpensesList: React.FC<ExpensesListProps> = ({ expenses, onRemoveExpense }) => {
  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Нет расходов</Text>
        <Text style={styles.emptySubtext}>Начните записывать голосом</Text>
      </View>
    );
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Расходы</Text>
        <Text style={styles.total}>Всего: {totalAmount.toFixed(2)} €</Text>
      </View>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExpenseItem expense={item} onRemove={onRemoveExpense} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
  },
  listContent: {
    paddingBottom: 20,
  },
  expenseItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseContent: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  category: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    textTransform: 'capitalize',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  description: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#adb5bd',
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
  },
}); 