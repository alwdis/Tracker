const https = require('https');
const fs = require('fs');

// Замените на ваш GitHub токен
const GITHUB_TOKEN = 'ghp_your_token_here';
const REPO_OWNER = 'alwdis';
const REPO_NAME = 'Tracker';
const TAG_NAME = 'v4.0.1';

const releaseData = {
  tag_name: TAG_NAME,
  name: `Release ${TAG_NAME}`,
  body: `## Исправления в версии ${TAG_NAME}

### Исправленные ошибки
- Исправлена ошибка EPERM при создании бэкапов в Program Files
- Бэкапы теперь сохраняются в userData директории
- Убраны крестики из сообщений об ошибках
- Улучшена совместимость с Yandex.Disk синхронизацией

### Технические изменения
- Изменен путь создания папки Backup с process.execPath на userDataDir()
- Обновлены функции createManualBackup, getAvailableBackups, selectBackupFile
- Упрощен интерфейс сообщений об ошибках`,
  draft: false,
  prerelease: false
};

const postData = JSON.stringify(releaseData);

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: `/repos/${REPO_OWNER}/${REPO_NAME}/releases`,
  method: 'POST',
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'User-Agent': 'Tracker-Release-Script',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Создание релиза...');
console.log('Тег:', TAG_NAME);
console.log('Название:', releaseData.name);

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 201) {
      const response = JSON.parse(data);
      console.log('✅ Релиз успешно создан!');
      console.log('URL:', response.html_url);
    } else {
      console.error('❌ Ошибка создания релиза:');
      console.error('Статус:', res.statusCode);
      console.error('Ответ:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Ошибка запроса:', error.message);
});

req.write(postData);
req.end();
