# 🚀 Google Drive API - Быстрый старт

## ⏱️ Время: 15 минут

---

## 📋 Краткая инструкция

### 1️⃣ Создать проект (2 минуты)
```
🔗 https://console.cloud.google.com/

1. Select project → NEW PROJECT
2. Name: Tracker App
3. CREATE
```

### 2️⃣ Включить API (1 минута)
```
🔗 https://console.cloud.google.com/apis/library

1. Поиск: "Google Drive API"
2. ENABLE
```

### 3️⃣ OAuth Consent (5 минут)
```
🔗 https://console.cloud.google.com/apis/credentials/consent

1. External → CREATE
2. App name: Tracker
3. User support email: ваш@gmail.com
4. Developer email: ваш@gmail.com
5. SAVE AND CONTINUE

6. ADD OR REMOVE SCOPES
7. Найти: drive.file
8. Отметить ✅
9. UPDATE → SAVE AND CONTINUE

10. ADD USERS
11. Ваш email для теста
12. ADD → SAVE AND CONTINUE

13. BACK TO DASHBOARD
```

### 4️⃣ Создать Credentials (2 минуты)
```
🔗 https://console.cloud.google.com/apis/credentials

1. CREATE CREDENTIALS → OAuth client ID
2. Desktop app
3. Name: Tracker Desktop App
4. CREATE

📋 Скопировать:
   - Client ID: 123...xyz.apps.googleusercontent.com
   - Client Secret: GOCSPX-abc...xyz
```

### 5️⃣ Вставить в код (1 минута)
```javascript
// public/electron.js (строка ~130)

const GOOGLE_DRIVE_CONFIG = {
  clientId: 'ВАШ_CLIENT_ID',      // ← сюда
  clientSecret: 'ВАШ_CLIENT_SECRET', // ← сюда
  redirectUri: 'http://localhost',
  scopes: ['https://www.googleapis.com/auth/drive.file']
};
```

### 6️⃣ Тестировать (2 минуты)
```bash
npm run build
npm start
```

1. Открыть Cloud Sync (☁️)
2. Google Drive → Подключить
3. Авторизоваться
4. Синхронизация ✅

---

## 📝 Что важно запомнить

### ✅ ДА
- Создаёте API один раз
- Все пользователи используют ваши ключи
- Каждый видит только свои файлы
- Client Secret можно вшить в код (для desktop app)

### ❌ НЕТ
- Пользователям НЕ нужно создавать API
- Вы НЕ видите файлы пользователей
- Файлы НЕ общие между пользователями

---

## 🌐 Для публичного релиза

Когда готовы к публикации:

```
🔗 https://console.cloud.google.com/apis/credentials/consent

1. PUBLISH APP
2. Подтвердить
3. ✅ Готово!
```

Теперь любой пользователь может подключиться!

---

## 🆘 Проблемы?

### "Access blocked: This app's request is invalid"
→ Проверьте, что добавлены как Test User

### "Client ID not found"
→ Проверьте, что скопировали правильно (без пробелов)

### "API not enabled"
→ Вернитесь в Library, включите Google Drive API

---

## 📖 Подробная инструкция

См. файл: `GOOGLE_DRIVE_SETUP.md`

---

**Готово!** 🎉 Все пользователи могут использовать Google Drive!

