# Настройка Google Drive API для Tracker

## 📋 Быстрая настройка

### 1. Создайте файл конфигурации

Создайте файл `config/google-drive.js` в папке с приложением:

```javascript
// Google Drive API Configuration
module.exports = {
  GOOGLE_CLIENT_ID: 'ваш_client_id_здесь',
  GOOGLE_CLIENT_SECRET: 'ваш_client_secret_здесь'
};
```

### 2. Получите ключи API

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google Drive API
4. Создайте OAuth 2.0 credentials (Web application)
5. Добавьте redirect URI: `http://localhost:8888/oauth2callback`
6. Скопируйте Client ID и Client Secret

### 3. Вставьте ключи

Замените `ваш_client_id_здесь` и `ваш_client_secret_здесь` на ваши реальные ключи.

## 🔒 Безопасность

- **НЕ делитесь** файлом `config/google-drive.js` с другими
- **НЕ загружайте** его в публичные репозитории
- **Храните** ключи в безопасном месте

## 🚀 Использование

После настройки:
1. Перезапустите приложение
2. Откройте "Облачная синхронизация"
3. Выберите "Google Drive"
4. Нажмите "Подключить Google Drive"

## ❓ Проблемы

Если видите ошибку "Google Drive API не настроен":
1. Проверьте, что файл `config/google-drive.js` существует
2. Убедитесь, что ключи вставлены правильно
3. Перезапустите приложение

## 📚 Подробная инструкция

Для получения подробной инструкции по созданию Google Cloud проекта см. [Google Cloud Console Documentation](https://cloud.google.com/docs).
