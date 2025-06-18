import React, {useState} from 'react';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {GoogleAuthScreen} from './src/screens/GoogleAuthScreen';
import ExpenseTracker from './src/modules/expenses/ExpenseTracker';

const SPREADSHEET_ID = 'ВАШ_ID_ТАБЛИЦЫ';
const WEB_CLIENT_ID = 'orbitric.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  console.log({accessToken});

  if (!accessToken) {
    return <GoogleAuthScreen onAuth={setAccessToken} />;
  }

  return (
    <ExpenseTracker
      googleAccessToken={accessToken}
      spreadsheetId={SPREADSHEET_ID}
    />
  );
}
