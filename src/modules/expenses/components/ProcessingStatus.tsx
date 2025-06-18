import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface ProcessingStatusProps {
  isProcessing: boolean;
  recognizedText: string;
  error: string | null;
  lastExpense: any | null;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  isProcessing,
  recognizedText,
  error,
  lastExpense,
}) => {
  if (!isProcessing && !recognizedText && !error && !lastExpense) {
    return null;
  }

  return (
    <View style={styles.container}>
      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="small" color="#007bff" />
          <Text style={styles.processingText}>Анализирую трату...</Text>
        </View>
      )}

      {recognizedText && !isProcessing && (
        <View style={styles.recognizedContainer}>
          <Text style={styles.recognizedLabel}>Распознанный текст:</Text>
          <Text style={styles.recognizedText}>"{recognizedText}"</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorLabel}>Ошибка:</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {lastExpense && !isProcessing && (
        <View style={styles.successContainer}>
          <Text style={styles.successLabel}>✅ Трата добавлена:</Text>
          <View style={styles.expensePreview}>
            <View style={styles.expenseHeader}>
              <Text style={styles.expenseAmount}>
                {lastExpense.amount.toFixed(2)} {lastExpense.currency}
              </Text>
              <Text style={styles.expenseCategory}>{lastExpense.category}</Text>
            </View>
            
            <Text style={styles.expenseDescription}>{lastExpense.description}</Text>
            
            {lastExpense.location && (
              <Text style={styles.expenseDetail}>📍 {lastExpense.location}</Text>
            )}
            
            {lastExpense.merchant && (
              <Text style={styles.expenseDetail}>🏪 {lastExpense.merchant}</Text>
            )}
            
            {lastExpense.paymentMethod && (
              <Text style={styles.expenseDetail}>💳 {lastExpense.paymentMethod}</Text>
            )}
            
            {lastExpense.quantity && lastExpense.unit && (
              <Text style={styles.expenseDetail}>
                📦 {lastExpense.quantity} {lastExpense.unit}
              </Text>
            )}
            
            {lastExpense.tags && lastExpense.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {lastExpense.tags.slice(0, 3).map((tag: string, index: number) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.priorityContainer}>
              <View 
                style={[
                  styles.priorityBadge, 
                  { backgroundColor: getPriorityColor(lastExpense.priority || 'medium') }
                ]}
              >
                <Text style={styles.priorityText}>
                  {getPriorityText(lastExpense.priority || 'medium')}
                </Text>
              </View>
              {lastExpense.isRecurring && (
                <View style={styles.recurringBadge}>
                  <Text style={styles.recurringText}>🔄 Повторяющийся</Text>
                </View>
              )}
            </View>
            
            {lastExpense.notes && (
              <Text style={styles.expenseNotes}>📝 {lastExpense.notes}</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

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

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'Высокий';
    case 'medium':
      return 'Средний';
    case 'low':
      return 'Низкий';
    default:
      return 'Средний';
  }
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
  },
  recognizedContainer: {
    marginBottom: 12,
  },
  recognizedLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  recognizedText: {
    fontSize: 16,
    color: '#2c3e50',
    fontStyle: 'italic',
  },
  errorContainer: {
    marginBottom: 12,
  },
  errorLabel: {
    fontSize: 14,
    color: '#dc3545',
    marginBottom: 4,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
  },
  successContainer: {
    marginBottom: 12,
  },
  successLabel: {
    fontSize: 14,
    color: '#28a745',
    marginBottom: 8,
    fontWeight: '500',
  },
  expensePreview: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  expenseCategory: {
    fontSize: 14,
    color: '#2c3e50',
    textTransform: 'capitalize',
  },
  expenseDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 6,
  },
  expenseDetail: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginVertical: 6,
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
    marginTop: 6,
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
  expenseNotes: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 6,
  },
}); 