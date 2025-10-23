# 🔧 Создание OAuth Client ID типа "Web application"

## ⚠️ Проблема:

OAuth Client ID типа **"Desktop app"** не имеет поля "Authorized redirect URIs".
Нужно создать новый OAuth Client ID типа **"Web application"**.

---

## 📋 Пошаговая инструкция (3 минуты):

### Шаг 1: Открыть Credentials

```
https://console.cloud.google.com/apis/credentials
```

---

### Шаг 2: Создать новый OAuth Client ID

1. **Нажмите** `+ CREATE CREDENTIALS` (вверху)

2. **Выберите** `OAuth client ID`

---

### Шаг 3: Заполнить форму

#### Application type:
```
Выберите: Web application  ← ВАЖНО! НЕ Desktop app!
```

#### Name:
```
Tracker Web App
```

#### Authorized JavaScript origins (опционально):

**Нажмите** `+ ADD URI` и добавьте:
```
http://localhost:8888
```

#### Authorized redirect URIs:

**Нажмите** `+ ADD URI` и добавьте:
```
http://localhost:8888/oauth2callback
```

---

### Шаг 4: Создать

**Нажмите** `CREATE`

Появится окно с ключами:

```
┌────────────────────────────────────────────────────┐
│  Your Client ID:                                   │
│  123456789012-НОВЫЙ-ID.apps.googleusercontent.com  │
│                                                    │
│  Your Client Secret:                               │
│  GOCSPX-НОВЫЙ-SECRET                              │
└────────────────────────────────────────────────────┘
```

**Скопируйте** оба ключа!

---

### Шаг 5: Отправить мне новые ключи

Напишите:
```
Client ID: [ваш новый Client ID]
Client Secret: [ваш новый Client Secret]
```

Я обновлю их в коде и перезапущу приложение.

---

## 💡 Почему Web application, а не Desktop app?

### Desktop app:
- ❌ Нет поля "Authorized redirect URIs"
- ❌ Использует специальный loopback flow
- ❌ Сложнее настроить для Electron

### Web application:
- ✅ Есть поле "Authorized redirect URIs"
- ✅ Можно указать http://localhost:8888/oauth2callback
- ✅ Проще интегрировать с локальным HTTP сервером
- ✅ Работает отлично для Electron приложений

---

## 🔐 Безопасность:

Не переживайте! Это нормальная практика:
- Client ID для Web application не считается секретным
- Client Secret можно вшить в код для desktop приложения
- Настоящая безопасность - в OAuth flow и токенах пользователя
- Каждый пользователь авторизуется через свой Google аккаунт

---

## ⏱️ После создания:

1. Скопируйте новый Client ID и Client Secret
2. Отправьте мне
3. Я обновлю код
4. Перезапущу приложение
5. Протестируем снова! ✅

---

**Создайте Web application OAuth Client ID прямо сейчас!** 🚀

