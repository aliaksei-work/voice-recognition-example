import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';

interface SyncButtonsProps {
  onUploadToSheets: () => Promise<void>;
  onDownloadFromSheets: () => Promise<void>;
  isUploading?: boolean;
  isDownloading?: boolean;
}

export const SyncButtons: React.FC<SyncButtonsProps> = ({
  onUploadToSheets,
  onDownloadFromSheets,
  isUploading = false,
  isDownloading = false,
}) => {
  const [isUploadingLocal, setIsUploadingLocal] = useState(false);
  const [isDownloadingLocal, setIsDownloadingLocal] = useState(false);

  const handleUploadToSheets = async () => {
    Alert.alert(
      'Загрузка в Google Sheets',
      'Все локальные траты будут загружены в Google Sheets. Существующие данные в таблице будут заменены. Продолжить?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Загрузить',
          style: 'destructive',
          onPress: async () => {
            setIsUploadingLocal(true);
            try {
              await onUploadToSheets();
              Alert.alert('Успех', 'Все траты успешно загружены в Google Sheets');
            } catch (error) {
              Alert.alert('Ошибка', `Не удалось загрузить траты: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            } finally {
              setIsUploadingLocal(false);
            }
          },
        },
      ]
    );
  };

  const handleDownloadFromSheets = async () => {
    Alert.alert(
      'Загрузка из Google Sheets',
      'Все локальные траты будут заменены данными из Google Sheets. Продолжить?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Загрузить',
          style: 'destructive',
          onPress: async () => {
            setIsDownloadingLocal(true);
            try {
              await onDownloadFromSheets();
              Alert.alert('Успех', 'Все траты успешно загружены из Google Sheets');
            } catch (error) {
              Alert.alert('Ошибка', `Не удалось загрузить траты: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            } finally {
              setIsDownloadingLocal(false);
            }
          },
        },
      ]
    );
  };

  const isLoading = isUploading || isDownloading || isUploadingLocal || isDownloadingLocal;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Синхронизация с Google Sheets</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.uploadButton]}
          onPress={handleUploadToSheets}
          disabled={isLoading}
        >
          {isUploading || isUploadingLocal ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>📤</Text>
              <Text style={styles.buttonText}>Загрузить в таблицу</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.downloadButton]}
          onPress={handleDownloadFromSheets}
          disabled={isLoading}
        >
          {isDownloading || isDownloadingLocal ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>📥</Text>
              <Text style={styles.buttonText}>Загрузить из таблицы</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>
        Загрузите все локальные траты в Google Sheets или замените локальные данные данными из таблицы
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 48,
  },
  uploadButton: {
    backgroundColor: '#28a745',
  },
  downloadButton: {
    backgroundColor: '#007bff',
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 16,
  },
}); 