# Настройка Google Sign-In

## Проблемы, которые нужно исправить:

### 1. Создать проект в Google Cloud Console

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google Sign-In API:
   - Перейдите в "APIs & Services" > "Library"
   - Найдите "Google Sign-In API" и включите его

### 2. Настроить OAuth 2.0

1. В "APIs & Services" > "Credentials" создайте OAuth 2.0 Client ID
2. Для Android добавьте:
   - Package name: `com.orbitric`
   - SHA-1 fingerprint (получите командой):
     ```bash
     npm run get-sha1
     ```
3. Для Web создайте Web Client ID (нужен для React Native)

### 3. Скачать google-services.json

1. В Google Cloud Console перейдите в "Project Settings"
2. Скачайте файл `google-services.json`
3. Поместите его в папку `android/app/`

### 4. Обновить код

В файле `App.tsx` замените `YOUR_ACTUAL_WEB_CLIENT_ID` на ваш реальный Web Client ID:

```typescript
const WEB_CLIENT_ID = '123456789-abcdefghijklmnop.apps.googleusercontent.com';
```

### 5. Пересобрать приложение

```bash
cd android && ./gradlew clean
cd .. && npx react-native run-android
```

## Проверка работы

После настройки:
1. Запустите приложение
2. Нажмите "Войти с Google"
3. Должно появиться окно выбора Google аккаунта
4. После успешного входа вы увидите ExpenseTracker

## Отладка

Если проблемы остаются:
1. Проверьте консоль на наличие ошибок
2. Убедитесь, что `google-services.json` находится в правильном месте
3. Проверьте, что Web Client ID правильный
4. Убедитесь, что SHA-1 fingerprint соответствует вашему keystore 