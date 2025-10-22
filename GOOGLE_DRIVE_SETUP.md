# Настройка Google Drive API для облачной синхронизации

## Шаг 1: Создание проекта в Google Cloud Console

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google Drive API:
   - Перейдите в "APIs & Services" > "Library"
   - Найдите "Google Drive API" и включите его

## Шаг 2: Создание OAuth 2.0 учетных данных

1. Перейдите в "APIs & Services" > "Credentials"
2. Нажмите "Create Credentials" > "OAuth 2.0 Client IDs"
3. Выберите "Desktop application"
4. Назовите приложение (например, "Tracker Cloud Sync")
5. Скопируйте Client ID и Client Secret

## Шаг 3: Настройка в приложении

1. Откройте файл `public/electron.js`
2. Найдите секцию `GOOGLE_DRIVE_CONFIG`
3. Замените `YOUR_GOOGLE_CLIENT_ID` и `YOUR_GOOGLE_CLIENT_SECRET` на ваши значения:

```javascript
const GOOGLE_DRIVE_CONFIG = {
  clientId: 'ваш-client-id.apps.googleusercontent.com',
  clientSecret: 'ваш-client-secret',
  redirectUri: 'http://localhost:3000',
  scopes: ['https://www.googleapis.com/auth/drive.file']
};
```

## Шаг 4: Тестирование

1. Запустите приложение: `npm start`
2. Нажмите на кнопку облачной синхронизации (иконка облака)
3. Нажмите "Подключить" - откроется браузер для авторизации
4. Разрешите доступ к Google Drive
5. Скопируйте код авторизации и вставьте в приложение

## Примечания

- Данные сохраняются в папке приложения в Google Drive (не видны пользователю)
- Автоматическая синхронизация включается по умолчанию
- Можно отключить автосинхронизацию в настройках диалога

## Безопасность

- Client Secret должен храниться в безопасности
- В продакшене рекомендуется использовать переменные окружения
- Токены доступа сохраняются локально в зашифрованном виде
