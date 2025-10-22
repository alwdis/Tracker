const { execSync } = require('child_process');
const fs = require('fs');

const { execSync } = require('child_process');
const fs = require('fs');

function getChangesSinceLastTag() {
  try {
    // Получаем последний тег
    const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    
    // Получаем коммиты с последнего тега
    const commits = execSync(`git log ${lastTag}..HEAD --oneline --pretty=format:"- %s"`, { encoding: 'utf8' });
    
    return commits.trim();
  } catch (error) {
    // Если тегов нет, получаем последние коммиты
    const commits = execSync('git log --oneline -10 --pretty=format:"- %s"', { encoding: 'utf8' });
    return commits.trim();
  }
}

function generateReleaseNotes(version, type) {
  const changes = getChangesSinceLastTag();
  
  let releaseType = '';
  switch (type) {
    case 'major':
      releaseType = '🚀 Major Release';
      break;
    case 'minor':
      releaseType = '✨ Feature Release';
      break;
    case 'patch':
      releaseType = '🐛 Bugfix Release';
      break;
  }
  
  const releaseNotes = `# Tracker v${version} - ${releaseType}

## 📝 Что изменилось

${changes || '- Обновления и улучшения'}

## 📥 Установка

1. Скачайте \`Tracker-Setup-${version}.exe\` из Assets ниже
2. Запустите установщик
3. Следуйте инструкциям установщика

## 🔄 Автообновление

Приложение автоматически проверит наличие новых версий и предложит обновление.

---

**Размер установщика**: ~76 МБ  
**Версия**: ${version}  
**Дата релиза**: ${new Date().toLocaleDateString('ru-RU')}`;

  return releaseNotes;
}

function updateVersion(type = 'patch') {
  console.log(`Updating ${type} version...`);
  
  // Обновляем версию в package.json
  execSync(`npm version ${type}`, { stdio: 'inherit' });
  
  // Получаем новую версию
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const version = packageJson.version;
  
  console.log(`New version: ${version}`);
  
  // Генерируем заметки о релизе
  const releaseNotes = generateReleaseNotes(version, type);
  const releaseNotesPath = `RELEASE_NOTES_v${version}.md`;
  
  fs.writeFileSync(releaseNotesPath, releaseNotes);
  console.log(`Created release notes: ${releaseNotesPath}`);
  
  return version;
}

function createTagAndPush(version) {
  const tagName = `v${version}`;
  
  console.log(`Creating tag ${tagName}...`);
  
  // Создаем тег
  execSync(`git add .`, { stdio: 'inherit' });
  execSync(`git commit -m "Release ${tagName}"`, { stdio: 'inherit' });
  execSync(`git tag -a ${tagName} -m "Release ${tagName}"`, { stdio: 'inherit' });
  
  // Пушим изменения и тег
  execSync(`git push`, { stdio: 'inherit' });
  execSync(`git push origin ${tagName}`, { stdio: 'inherit' });
  
  console.log(`Tag ${tagName} created and pushed`);
  console.log('GitHub Actions will now build and create the release automatically!');
}

// Основная функция
function main() {
  const type = process.argv[2] || 'patch';
  
  if (!['patch', 'minor', 'major'].includes(type)) {
    console.error('Version type must be patch, minor, or major');
    process.exit(1);
  }
  
  try {
    const version = updateVersion(type);
    createTagAndPush(version);
    
    console.log(`\n🎉 Release ${version} initiated!`);
    console.log('Check GitHub Actions for build progress:');
    console.log('https://github.com/alwdis/Tracker/actions');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
