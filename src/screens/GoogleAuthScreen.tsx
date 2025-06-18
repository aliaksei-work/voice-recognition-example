import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const GoogleAuthScreen: React.FC<{ onAuth: (token: string) => void }> = ({ onAuth }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    console.log('Starting Google Sign-In process...');
    
    try {
      console.log('Checking Play Services...');
      const hasPlayServices = await GoogleSignin.hasPlayServices();
      console.log('Play Services available:', hasPlayServices);
      
      if (!hasPlayServices) {
        Alert.alert('Ошибка', 'Google Play Services недоступны');
        return;
      }

      console.log('Initiating sign in...');
      const userInfo = await GoogleSignin.signIn();
      console.log('Sign in successful, user info:', userInfo);
      
      console.log('Getting tokens...');
      const tokens = await GoogleSignin.getTokens();
      console.log('Tokens received:', tokens);
      
      if (tokens.accessToken) {
        console.log('Calling onAuth with token...');
        onAuth(tokens.accessToken);
      } else {
        Alert.alert('Ошибка', 'Не удалось получить токен доступа');
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      
      let errorMessage = 'Произошла ошибка при входе';
      
      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMessage = 'Вход отменен пользователем';
      } else if (error.code === 'SIGN_IN_REQUIRED') {
        errorMessage = 'Требуется повторный вход';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Google Play Services недоступны';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Ошибка входа', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Вход через Google</Text>
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleGoogleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Вход...' : 'Войти с Google'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  logo: { width: 180, height: 180, marginBottom: 32 },
  title: { fontSize: 22, color: '#fff', marginBottom: 24 },
  button: { backgroundColor: '#00e6d6', padding: 16, borderRadius: 8 },
  buttonDisabled: { backgroundColor: '#666' },
  buttonText: { color: '#111', fontWeight: 'bold', fontSize: 16 },
}); 