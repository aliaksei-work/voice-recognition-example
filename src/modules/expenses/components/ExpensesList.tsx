import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Expense } from '../hooks/useExpenses';

export interface ExpensesListProps {
  expenses: Expense[];
  onRemoveExpense: (id: string) => void;
  onClearAll?: () => void;
}

export const ExpensesList: React.FC<ExpensesListProps> = ({
  expenses,
  onRemoveExpense,
  onClearAll,
}) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseContent}>
        <View style={styles.expenseHeader}>
          <Text style={styles.expenseDescription}>{item.description}</Text>
          <Text style={styles.expenseAmount}>
            {item.amount.toFixed(2)} {item.currency}
          </Text>
        </View>
        
        <View style={styles.expenseDetails}>
          <Text style={styles.expenseTime}>{formatTime(item.timestamp)}</Text>
          <Text style={styles.expenseCategory}>{item.category}</Text>
          {item.location && (
            <Text style={styles.expenseLocation}>📍 {item.location}</Text>
          )}
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemoveExpense(item.id)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  if (expenses.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Последние траты</Text>
        {onClearAll && (
          <TouchableOpacity onPress={onClearAll} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Очистить все</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
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
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dc3545',
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  expenseInfo: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    textTransform: 'capitalize',
  },
  location: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  quantity: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  expenseDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#adb5bd',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#6c757d',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#6c757d',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  recurringBadge: {
    backgroundColor: '#17a2b8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  recurringText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  merchant: {
    fontSize: 12,
    color: '#6c757d',
  },
  notes: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
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
  expenseDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    flex: 1,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  expenseTime: {
    fontSize: 12,
    color: '#adb5bd',
  },
  expenseCategory: {
    fontSize: 12,
    color: '#6c757d',
    textTransform: 'capitalize',
  },
  expenseLocation: {
    fontSize: 12,
    color: '#6c757d',
  },
}); 