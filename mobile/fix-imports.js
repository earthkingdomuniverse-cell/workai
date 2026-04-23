const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const mobileDir = '/Users/lha/Documents/workai/mobile';
const appDir = path.join(mobileDir, 'app');

walk(appDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix theme imports
    if (content.includes("from '../../src/theme'")) {
      content = content.replace(/from '\.\.\/\.\.\/src\/theme'/g, "from '../../theme'");
      changed = true;
    }
    if (content.includes("from '../../../src/theme'")) {
      content = content.replace(/from '\.\.\/\.\.\/\.\.\/src\/theme'/g, "from '../../../theme'");
      changed = true;
    }

    // Also fix auth-store imports if any are still broken
    if (content.includes("from '../../store/auth-store'")) {
      content = content.replace(/from '\.\.\/\.\.\/store\/auth-store'/g, "from '../../src/store/auth-store'");
      changed = true;
    }

    if (changed) {
      console.log(`Fixing ${filePath}`);
      fs.writeFileSync(filePath, content);
    }
  }
});
