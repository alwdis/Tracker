#!/usr/bin/env node
/**
 * release.js
 * Bumps version (patch|minor|major or x.y.z), commits & tags via `npm version`,
 * then pushes branch and tag to origin. Triggers GH Actions release workflow.
 * Now auto-commits lockfile changes after `npm install` so the tree is clean.
 */
const { spawnSync } = require('child_process');

function run(cmd, opts = {}) {
  const res = spawnSync(cmd, { shell: true, stdio: 'pipe', encoding: 'utf-8', ...opts });
  if (res.status != 0) {
    const out = res.stdout || '';
    const err = res.stderr || '';
    throw new Error(`Command failed: ${cmd}\n${out}\n${err}`);
  }
  return (res.stdout || '').trim();
}
function tryRun(cmd) {
  const res = spawnSync(cmd, { shell: true, stdio: 'pipe', encoding: 'utf-8' });
  return { code: res.status ?? 0, out: (res.stdout||'') + (res.stderr||'') };
}
function log(step) { console.log(`\n\u001b[36m==> ${step}\u001b[0m`); }

(async () => {
  try {
    const bump = process.argv[2] || 'patch';
    const isSemver = /^\d+\.\d+\.\d+$/.test(bump);
    const isType = /^(patch|minor|major)$/.test(bump);
    if (!isSemver && !isType) {
      console.error('Usage: node scripts/release.js [patch|minor|major|x.y.z]');
      process.exit(1);
    }

    // 0) Basic checks
    log('Checking git status & remote...');
    const statusBefore = run('git status --porcelain');
    if (statusBefore) {
      console.error('Working tree is not clean. Commit or stash your changes first.');
      console.error(statusBefore);
      process.exit(1);
    }
    let branch = 'unknown';
    try { branch = run('git rev-parse --abbrev-ref HEAD'); } catch {}
    let originUrl = '';
    try { originUrl = run('git remote get-url origin'); } catch {}
    if (!originUrl) {
      console.error('Remote "origin" is not set. Add it: git remote add origin <URL>');
      process.exit(1);
    }
    console.log(`Branch: ${branch} • Origin: ${originUrl}`);

    // 1) Ensure lock in sync
    log('Installing deps to sync lock (npm install)...');
    run('npm install');

    // If npm install changed lockfile or anything else, commit it
    const statusAfterInstall = run('git status --porcelain');
    if (statusAfterInstall) {
      log('Committing lockfile changes made by npm install...');
      run('git add -A');
      run('git commit -m "chore: sync lockfile before release"');
    }

    // 2) Bump version with npm version (creates commit + tag vX.Y.Z)
    log(`Bumping version via npm version ${bump} ...`);
    const out = run(`npm version ${bump} -m "chore: release %s"`);
    const newVersion = out.replace(/^v/, '').trim();
    const tagName = `v${newVersion}`;
    console.log(`New version: ${newVersion}`);

    // 3) Push branch + tag
    log('Pushing branch...');
    const pushBranch = tryRun('git push origin HEAD');
    if (pushBranch.code !== 0) {
      console.warn('Push of branch failed (maybe protected branch). You may need to open a PR.');
      console.warn(pushBranch.out.split('\n').slice(-20).join('\n'));
    }

    log(`Pushing tag ${tagName} ...`);
    run(`git push origin ${tagName}`);

    console.log('\n✅ Done. GitHub Actions should start the release workflow on this tag.');
    console.log(`   Tag: ${tagName}`);
  } catch (err) {
    console.error('\n❌ Release failed:\n' + err.message);
    process.exit(1);
  }
})();
