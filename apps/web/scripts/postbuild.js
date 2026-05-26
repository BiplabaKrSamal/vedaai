/**
 * Copies public/ and static assets into .next/standalone
 * so the standalone server can serve them on Render/Railway/etc.
 */
const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src,  entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

const root = path.join(__dirname, '..');

// public/ → standalone/.../public
copyDir(
  path.join(root, 'public'),
  path.join(root, '.next', 'standalone', 'apps', 'web', 'public')
);

// .next/static → standalone/.next/static
copyDir(
  path.join(root, '.next', 'static'),
  path.join(root, '.next', 'standalone', 'apps', 'web', '.next', 'static')
);

console.log('✓ Postbuild: standalone assets copied');
