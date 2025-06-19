import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {BurgerMenu} from '../../expenses/components/BurgerMenu';

interface VoiceHeaderProps {
  onSettingsPress: () => void;
}

export const VoiceHeader: React.FC<VoiceHeaderProps> = ({onSettingsPress}) => {
  return (
    <View style={styles.container}>
      <BurgerMenu onSettingsPress={onSettingsPress} />
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>Orbitric</Text>
      </View>
      <Text style={styles.subtitle}>
        Умный учет расходов с голосовым вводом
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    position: 'relative',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
  },
});
