import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Expense } from '../hooks/useExpenses';

interface ExpenseStatsProps {
  expenses: Expense[];
}

export const ExpenseStats: React.FC<ExpenseStatsProps> = ({ expenses }) => {
  if (expenses.length === 0) {
    return null;
  }

  // Calculate statistics
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageAmount = totalAmount / expenses.length;
  
  // Group by category
  const categoryStats = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Group by currency
  const currencyStats = expenses.reduce((acc, expense) => {
    acc[expense.currency] = (acc[expense.currency] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Count recurring expenses
  const recurringCount = expenses.filter(expense => expense.isRecurring).length;
  
  // Count high priority expenses
  const highPriorityCount = expenses.filter(expense => expense.priority === 'high').length;

  // Get top merchants
  const merchantStats = expenses.reduce((acc, expense) => {
    if (expense.merchant) {
      acc[expense.merchant] = (acc[expense.merchant] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topMerchants = Object.entries(merchantStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Get top payment methods
  const paymentMethodStats = expenses.reduce((acc, expense) => {
    if (expense.paymentMethod) {
      acc[expense.paymentMethod] = (acc[expense.paymentMethod] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

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

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'RUB': return '₽';
      case 'GBP': return '£';
      default: return currency;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Статистика трат</Text>
      
      {/* Total and Average */}
      <View style={styles.row}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Общая сумма</Text>
          <Text style={styles.statValue}>{totalAmount.toFixed(2)} €</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Средняя трата</Text>
          <Text style={styles.statValue}>{averageAmount.toFixed(2)} €</Text>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>По категориям</Text>
        {Object.entries(categoryStats)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([category, amount]) => (
            <View key={category} style={styles.categoryRow}>
              <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={styles.categoryAmount}>{amount.toFixed(2)} €</Text>
            </View>
          ))}
      </View>

      {/* Currencies */}
      {Object.keys(currencyStats).length > 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>По валютам</Text>
          {Object.entries(currencyStats).map(([currency, amount]) => (
            <View key={currency} style={styles.currencyRow}>
              <Text style={styles.currencySymbol}>{getCurrencySymbol(currency)}</Text>
              <Text style={styles.currencyName}>{currency}</Text>
              <Text style={styles.currencyAmount}>{amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Special indicators */}
      <View style={styles.row}>
        {recurringCount > 0 && (
          <View style={styles.indicatorCard}>
            <Text style={styles.indicatorIcon}>🔄</Text>
            <Text style={styles.indicatorLabel}>Повторяющиеся</Text>
            <Text style={styles.indicatorValue}>{recurringCount}</Text>
          </View>
        )}
        {highPriorityCount > 0 && (
          <View style={styles.indicatorCard}>
            <Text style={styles.indicatorIcon}>⚠️</Text>
            <Text style={styles.indicatorLabel}>Высокий приоритет</Text>
            <Text style={styles.indicatorValue}>{highPriorityCount}</Text>
          </View>
        )}
      </View>

      {/* Top merchants */}
      {topMerchants.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Топ магазинов</Text>
          {topMerchants.map(([merchant, count]) => (
            <View key={merchant} style={styles.merchantRow}>
              <Text style={styles.merchantIcon}>🏪</Text>
              <Text style={styles.merchantName}>{merchant}</Text>
              <Text style={styles.merchantCount}>{count} покупок</Text>
            </View>
          ))}
        </View>
      )}

      {/* Payment methods */}
      {Object.keys(paymentMethodStats).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Способы оплаты</Text>
          {Object.entries(paymentMethodStats).map(([method, count]) => (
            <View key={method} style={styles.paymentRow}>
              <Text style={styles.paymentIcon}>💳</Text>
              <Text style={styles.paymentName}>{method}</Text>
              <Text style={styles.paymentCount}>{count}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    textTransform: 'capitalize',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  currencySymbol: {
    fontSize: 16,
    marginRight: 8,
  },
  currencyName: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  currencyAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
  },
  indicatorCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  indicatorIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  indicatorLabel: {
    fontSize: 10,
    color: '#6c757d',
    textAlign: 'center',
  },
  indicatorValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  merchantIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  merchantName: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  merchantCount: {
    fontSize: 12,
    color: '#6c757d',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  paymentIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  paymentName: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    textTransform: 'capitalize',
  },
  paymentCount: {
    fontSize: 12,
    color: '#6c757d',
  },
}); 