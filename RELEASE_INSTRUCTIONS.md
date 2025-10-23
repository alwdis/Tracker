# Инструкции для создания релиза v3.2.0 на GitHub

## Что уже сделано:
✅ Версия обновлена до 3.2.0 в package.json
✅ Все изменения закоммичены
✅ Создан тег v3.2.0
✅ Созданы релизные заметки (RELEASE_NOTES_v3.2.0.md)

## Что нужно сделать вручную:

### 1. Отправить коммиты на GitHub
```bash
git push origin master
git push origin v3.2.0
```

### 2. Создать релиз на GitHub.com
1. Перейти на https://github.com/alwdis/Tracker/releases
2. Нажать "Create a new release"
3. Выбрать тег: `v3.2.0`
4. Заголовок: `Release v3.2.0: Cloud Synchronization Support`
5. Скопировать содержимое из `RELEASE_NOTES_v3.2.0.md`
6. Нажать "Publish release"

### 3. Собрать и загрузить бинарные файлы
```bash
npm run build
npm run dist:win
```

Затем загрузить файлы из папки `dist/` в релиз на GitHub.

## Основные изменения в v3.2.0:
- 🌐 Google Drive интеграция с OAuth 2.0
- 📁 Yandex.Disk WebDAV интеграция  
- 🔄 Унифицированный диалог облачной синхронизации
- 🔧 Исправлены проблемы с dev режимом
- 📚 Добавлена документация по настройке API
- 🐛 Множественные исправления багов

## Файлы для релиза:
- `Tracker-Setup-3.2.0.exe` (Windows installer)
- `tracker-3.2.0-win.zip` (Portable version)
- `RELEASE_NOTES_v3.2.0.md` (Release notes)
