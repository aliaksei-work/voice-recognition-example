import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const GoogleAuthScreen: React.FC<{ onAuth: (token: string) => void }> = ({ onAuth }) => {
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      onAuth(tokens.accessToken);
    } catch (e) {
      console.warn('Google Sign-In error', e);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Вход через Google</Text>
      <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
        <Text style={styles.buttonText}>Войти с Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  logo: { width: 180, height: 180, marginBottom: 32 },
  title: { fontSize: 22, color: '#fff', marginBottom: 24 },
  button: { backgroundColor: '#00e6d6', padding: 16, borderRadius: 8 },
  buttonText: { color: '#111', fontWeight: 'bold', fontSize: 16 },
}); 