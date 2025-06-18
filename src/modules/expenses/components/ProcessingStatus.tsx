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
            <Text style={styles.expenseAmount}>{lastExpense.amount.toFixed(2)} €</Text>
            <Text style={styles.expenseCategory}>{lastExpense.category}</Text>
            <Text style={styles.expenseDescription}>{lastExpense.description}</Text>
          </View>
        </View>
      )}
    </View>
  );
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
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#2c3e50',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  expenseDescription: {
    fontSize: 12,
    color: '#6c757d',
  },
}); 