const { Octokit } = require('@octokit/rest');

async function checkReleaseAssets() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  
  try {
    const response = await octokit.rest.repos.getReleaseByTag({
      owner: 'alwdis',
      repo: 'Tracker',
      tag: 'v3.3.0'
    });
    
    console.log('Release v3.3.0:');
    console.log('Assets:', response.data.assets.length);
    
    if (response.data.assets.length > 0) {
      response.data.assets.forEach(asset => {
        console.log(`- ${asset.name} (${asset.size} bytes)`);
      });
    } else {
      console.log('No assets yet - GitHub Actions still building...');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkReleaseAssets();
