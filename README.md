# Orbitric

Мобильное приложение для распознавания голосовых расходов с интеграцией Google Sheets.

## Возможности

- 🎤 Голосовое распознавание расходов
- 📊 Автоматическое сохранение в Google Sheets
- 🔐 Безопасная авторизация через Google
- 📱 Современный интерфейс

## Установка

1. Клонируйте репозиторий
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Настройте Google Sign-In (см. `GOOGLE_SIGNIN_SETUP.md`)
4. Запустите приложение:
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   ```

## Технологии

- React Native 0.80.0
- TypeScript
- Google Sign-In
- Voice Recognition
- Google Sheets API

## Структура проекта

```
src/
├── assets/          # Изображения и ресурсы
├── modules/         # Основные модули приложения
│   ├── expenses/    # Модуль управления расходами
│   └── voiceTest/   # Тестирование голосового ввода
├── screens/         # Экраны приложения
└── types/           # TypeScript типы
```

## Лицензия

MIT 