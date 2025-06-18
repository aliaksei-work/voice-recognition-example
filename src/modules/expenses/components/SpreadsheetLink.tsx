import React from 'react';
import { View, TouchableOpacity, Text, Linking, StyleSheet } from 'react-native';

interface SpreadsheetLinkProps {
  spreadsheetId: string;
}

export const SpreadsheetLink: React.FC<SpreadsheetLinkProps> = ({ spreadsheetId }) => {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  const handleOpen = () => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleOpen} style={styles.button}>
        <Text style={styles.text}>Открыть таблицу в Google Sheets</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#00e6d6',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  text: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 