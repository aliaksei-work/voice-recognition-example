import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {Expense} from '../hooks/useExpenses';

export interface ExpenseStatsProps {
  expenses: Expense[];
}

export const ExpenseStats: React.FC<ExpenseStatsProps> = ({expenses}) => {
  if (expenses.length === 0) {
    return null;
  }

  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const primaryCurrency = expenses[0]?.currency || 'EUR';

  // Group by category
  const categoryStats = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Group by currency
  const currencyStats = expenses.reduce(
    (acc, expense) => {
      acc[expense.currency] = (acc[expense.currency] || 0) + expense.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Group by priority
  const priorityStats = expenses.reduce(
    (acc, expense) => {
      const priority = expense.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + expense.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Group by merchant
  const merchantStats = expenses.reduce(
    (acc, expense) => {
      if (expense.merchant) {
        acc[expense.merchant] = (acc[expense.merchant] || 0) + expense.amount;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  // Group by payment method
  const paymentStats = expenses.reduce(
    (acc, expense) => {
      if (expense.paymentMethod) {
        acc[expense.paymentMethod] =
          (acc[expense.paymentMethod] || 0) + expense.amount;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#dc3545';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const renderStatSection = (
    title: string,
    data: Record<string, number>,
    icon?: string,
    colorFn?: (key: string) => string,
  ) => {
    const sortedData = Object.entries(data).sort(([, a], [, b]) => b - a);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statsRow}>
            {sortedData.map(([key, value]) => (
              <View key={key} style={styles.statItem}>
                <View
                  style={[
                    styles.statIcon,
                    colorFn && {backgroundColor: colorFn(key)},
                  ]}>
                  <Text style={styles.statIconText}>
                    {icon || key.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.statLabel}>{key}</Text>
                <Text style={styles.statValue}>
                  {value.toFixed(2)} {primaryCurrency}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.totalSection}>
        <Text style={styles.totalTitle}>Общая сумма</Text>
        <Text style={styles.totalAmount}>
          {totalAmount.toFixed(2)} {primaryCurrency}
        </Text>
      </View>

      {renderStatSection(
        'По категориям',
        categoryStats,
        undefined,
        () => '#007bff',
      )}
      {renderStatSection('По валютам', currencyStats, '💱')}
      {renderStatSection(
        'По приоритетам',
        priorityStats,
        undefined,
        getPriorityColor,
      )}
      {Object.keys(merchantStats).length > 0 &&
        renderStatSection('По магазинам', merchantStats, '🏪')}
      {Object.keys(paymentStats).length > 0 &&
        renderStatSection('По способам оплаты', paymentStats, '💳')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  totalSection: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalTitle: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statIconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
});
