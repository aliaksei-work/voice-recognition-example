import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Expense } from '../hooks/useExpenses';

interface ExpenseHistoryProps {
  expenses: Expense[];
  getExpensesByCategory: () => Record<string, Record<string, Expense[]>>;
  getCategoryTotal: (category: string) => number;
  getCategoryDateTotal: (category: string, date: string) => number;
  getCategories: () => string[];
  onRemoveExpense: (id: string) => void;
}

export const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({
  expenses,
  getExpensesByCategory,
  getCategoryTotal,
  getCategoryDateTotal,
  getCategories,
  onRemoveExpense,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const categories = getCategories();
  const groupedExpenses = getExpensesByCategory();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍽️';
      case 'transport': return '🚗';
      case 'entertainment': return '🎬';
      case 'shopping': return '🛍️';
      case 'health': return '🏥';
      case 'education': return '📚';
      case 'utilities': return '⚡';
      default: return '💰';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    // Отладочная информация
    console.log('Expense item:', {
      id: item.id,
      description: item.description,
      category: item.category,
      subcategory: item.subcategory,
      amount: item.amount,
      notes: item.notes,
      merchant: item.merchant
    });

    // Определяем, что показывать как описание
    const displayDescription = item.description || item.notes || item.merchant || `${item.category} - ${item.subcategory}`;

    return (
      <View style={styles.expenseItem}>
        <View style={styles.expenseContent}>
          <View style={styles.expenseHeader}>
            <Text style={styles.expenseDescription}>{displayDescription}</Text>
            <Text style={styles.expenseAmount}>
              {item.amount.toFixed(2)} {item.currency}
            </Text>
          </View>
          
          <View style={styles.expenseDetails}>
            <Text style={styles.expenseTime}>{formatTime(item.timestamp)}</Text>
            {item.location && (
              <Text style={styles.expenseLocation}>📍 {item.location}</Text>
            )}
            {item.paymentMethod && (
              <Text style={styles.expensePayment}>💳 {item.paymentMethod}</Text>
            )}
          </View>
          
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemoveExpense(item.id)}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDateSection = (category: string, date: string, expenses: Expense[]) => {
    const isExpanded = expandedDates.has(date);
    const totalAmount = getCategoryDateTotal(category, date);
    const primaryCurrency = expenses[0]?.currency || 'EUR';

    return (
      <View key={date} style={styles.dateSection}>
        <TouchableOpacity
          style={styles.dateHeader}
          onPress={() => toggleDateExpansion(date)}
        >
          <View style={styles.dateInfo}>
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            <Text style={styles.dateTotal}>
              {totalAmount.toFixed(2)} {primaryCurrency}
            </Text>
          </View>
          <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.expensesList}>
            {expenses.map(expense => (
              <View key={expense.id}>
                {renderExpenseItem({ item: expense })}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderCategorySection = ({ item: category }: { item: string }) => {
    const categoryExpenses = groupedExpenses[category];
    const totalAmount = getCategoryTotal(category);
    const primaryCurrency = Object.values(categoryExpenses)[0]?.[0]?.currency || 'EUR';
    const isSelected = selectedCategory === category;

    return (
      <View style={styles.categorySection}>
        <TouchableOpacity
          style={[styles.categoryHeader, isSelected && styles.selectedCategoryHeader]}
          onPress={() => setSelectedCategory(isSelected ? null : category)}
        >
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
            <Text style={styles.categoryName}>{category}</Text>
          </View>
          <View style={styles.categoryStats}>
            <Text style={styles.categoryTotal}>
              {totalAmount.toFixed(2)} {primaryCurrency}
            </Text>
            <Text style={styles.categoryCount}>
              {Object.values(categoryExpenses).flat().length} трат
            </Text>
          </View>
        </TouchableOpacity>
        
        {isSelected && (
          <View style={styles.categoryContent}>
            {Object.entries(categoryExpenses).map(([date, expenses]) =>
              renderDateSection(category, date, expenses)
            )}
          </View>
        )}
      </View>
    );
  };

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>История трат пуста</Text>
        <Text style={styles.emptySubtext}>Добавьте первую трату голосом</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 История трат</Text>
      <FlatList
        data={categories}
        renderItem={renderCategorySection}
        keyExtractor={(item) => item}
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  categorySection: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedCategoryHeader: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    textTransform: 'capitalize',
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  categoryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  categoryCount: {
    fontSize: 12,
    color: '#6c757d',
  },
  categoryContent: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginTop: 4,
    padding: 8,
  },
  dateSection: {
    marginBottom: 8,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 12,
  },
  dateTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
  },
  expandIcon: {
    fontSize: 12,
    color: '#6c757d',
  },
  expensesList: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginTop: 4,
    padding: 8,
  },
  expenseItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  expenseContent: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  expenseDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  expenseTime: {
    fontSize: 12,
    color: '#adb5bd',
  },
  expenseLocation: {
    fontSize: 12,
    color: '#6c757d',
  },
  expensePayment: {
    fontSize: 12,
    color: '#6c757d',
  },
  tagsContainer: {
    flexDirection: 'row',
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
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 14,
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