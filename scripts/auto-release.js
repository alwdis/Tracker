const { execSync } = require('child_process');
const fs = require('fs');


function updateVersion(type = 'patch') {
  console.log(`Updating ${type} version...`);
  
  // Update version in package.json
  execSync(`npm version ${type}`, { stdio: 'inherit' });
  
  // Get new version
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const version = packageJson.version;
  
  console.log(`New version: ${version}`);
  
  return version;
}

function createTagAndPush(version) {
  const tagName = `v${version}`;
  
  console.log(`Creating tag ${tagName}...`);
  
  // Create tag
  execSync(`git add .`, { stdio: 'inherit' });
  execSync(`git commit -m "Release ${tagName}"`, { stdio: 'inherit' });
  execSync(`git tag -a ${tagName} -m "Release ${tagName}"`, { stdio: 'inherit' });
  
  // Push changes and tag
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
