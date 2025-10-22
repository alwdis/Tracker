// prepare-build.js
// Копирует статические ресурсы в build/ и выкладывает JS рендера рядом с index.html в build/public/
const fs = require('fs');
const path = require('path');

const repo = process.cwd();
const outBuild = path.resolve(repo, 'build');
const outPublic = path.join(outBuild, 'public');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function copyFile(src, destDir) {
  if (!fs.existsSync(src) || !fs.statSync(src).isFile()) return false;
  ensureDir(destDir);
  const dest = path.join(destDir, path.basename(src));
  fs.copyFileSync(src, dest);
  console.log('copied file:', path.relative(repo, src), '→', path.relative(repo, dest));
  return true;
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) return 0;
  ensureDir(dest);
  let count = 0;
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const st = fs.statSync(s);
    if (st.isDirectory()) count += copyDirRecursive(s, d);
    else {
      ensureDir(path.dirname(d));
      fs.copyFileSync(s, d);
      count++;
    }
  }
  console.log('copied dir :', path.relative(repo, src), '→', path.relative(repo, dest));
  return count;
}

ensureDir(outPublic);

// 1) Папки public → build/public и assets → build/assets (если есть)
copyDirRecursive(path.join(repo, 'public'), outPublic);
copyDirRecursive(path.join(repo, 'assets'), path.join(outBuild, 'assets'));

// 2) Кладём все верхнеуровневые *.js рендера рядом с index.html (build/public)
const exclude = new Set([
  // main-процесс и служебные скрипты
  'electron.js', 'preload.js', 'service-worker.js',
  'prepare-build.js', 'simple-build.js', 'create-installer.js'
]);

let moved = 0;
for (const name of fs.readdirSync(repo)) {
  if (!name.endsWith('.js')) continue;
  if (exclude.has(name)) continue;
  const abs = path.join(repo, name);
  if (fs.statSync(abs).isFile()) {
    if (copyFile(abs, outPublic)) moved++;
  }
}

// 3) На всякий — подкинем также верхнеуровневые *.css (если есть)
for (const name of fs.readdirSync(repo)) {
  if (!name.endsWith('.css')) continue;
  const abs = path.join(repo, name);
  if (fs.statSync(abs).isFile()) copyFile(abs, outPublic);
}

console.log(`prepare-build: renderer js files placed next to index.html: ${moved}`);
console.log('prepare-build: done (output →', outBuild, ')');
