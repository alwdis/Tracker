const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

async function createRelease() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }

  const octokit = new Octokit({
    auth: token,
  });

  // Получаем версию из package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const version = packageJson.version;
  const tagName = `v${version}`;

  console.log(`Creating release for version ${version}...`);

  try {
    // Проверяем, существует ли уже релиз
    try {
      await octokit.rest.repos.getReleaseByTag({
        owner: 'alwdis',
        repo: 'Tracker',
        tag: tagName,
      });
      console.log(`Release ${tagName} already exists`);
      return;
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
      // Релиз не существует, продолжаем
    }

    // Читаем описание релиза из нового шаблона
    const releaseNotesPath = `Release/RELEASE_NOTES_v${version}.md`;
    let releaseNotes;
    
    if (fs.existsSync(releaseNotesPath)) {
      releaseNotes = fs.readFileSync(releaseNotesPath, 'utf8');
    } else {
      // Fallback к простому шаблону
      releaseNotes = `# Tracker v${version} - Release

## 📝 Что изменилось:

- Обновления и улучшения

**Дата релиза**: ${new Date().toLocaleDateString('ru-RU')}`;
    }

    // Создаем релиз
    const release = await octokit.rest.repos.createRelease({
      owner: 'alwdis',
      repo: 'Tracker',
      tag_name: tagName,
      name: `Tracker v${version} - Персональный трекер медиа-контента`,
      body: releaseNotes,
      draft: false,
      prerelease: false,
    });

    console.log(`Release created: ${release.data.html_url}`);

    // Загружаем установщик
    const installerPath = path.join('dist', `Tracker-Setup-${version}.exe`);
    if (fs.existsSync(installerPath)) {
      console.log('Uploading installer...');
      
      const installerBuffer = fs.readFileSync(installerPath);
      
      await octokit.rest.repos.uploadReleaseAsset({
        owner: 'alwdis',
        repo: 'Tracker',
        release_id: release.data.id,
        name: `Tracker-Setup-${version}.exe`,
        data: installerBuffer,
        headers: {
          'content-type': 'application/octet-stream',
        },
      });

      console.log('Installer uploaded successfully');
    } else {
      console.warn(`Installer not found at ${installerPath}`);
    }

    // Загружаем latest.yml для автообновления
    const latestYmlPath = path.join('dist', 'latest.yml');
    if (fs.existsSync(latestYmlPath)) {
      console.log('Uploading latest.yml...');
      
      const latestYmlBuffer = fs.readFileSync(latestYmlPath);
      
      await octokit.rest.repos.uploadReleaseAsset({
        owner: 'alwdis',
        repo: 'Tracker',
        release_id: release.data.id,
        name: 'latest.yml',
        data: latestYmlBuffer,
        headers: {
          'content-type': 'text/yaml',
        },
      });

      console.log('latest.yml uploaded successfully');
    } else {
      console.warn(`latest.yml not found at ${latestYmlPath}`);
    }

  } catch (error) {
    console.error('Error creating release:', error);
    process.exit(1);
  }
}

createRelease();
