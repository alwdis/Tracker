const { Octokit } = require('@octokit/rest');

async function checkAllWorkflows() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  
  try {
    // Получаем все workflow runs
    const response = await octokit.rest.actions.listWorkflowRuns({
      owner: 'alwdis',
      repo: 'Tracker'
    });
    
    console.log('All recent workflow runs:');
    response.data.workflow_runs.slice(0, 5).forEach(run => {
      const status = run.status;
      const conclusion = run.conclusion || 'in_progress';
      const created = new Date(run.created_at).toLocaleString();
      const branch = run.head_branch;
      const sha = run.head_sha.substring(0, 7);
      const workflow = run.name;
      
      console.log(`- ${workflow}: ${status} ${conclusion} ${created} - ${branch} (${sha})`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAllWorkflows();
