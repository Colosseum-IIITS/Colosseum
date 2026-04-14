const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'components');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(componentsDir, filePath => {
  if (filePath.match(/\.(js|jsx|ts|tsx)$/)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix context imports
    const contextRegex = /from\s+['"]\.\.\/context\/([^'"]+)['"]/g;
    if (contextRegex.test(content)) {
      content = content.replace(contextRegex, `from '@/context/$1'`);
      modified = true;
    }

    // Fix ScrollableTable imports
    const tableRegex = /from\s+['"]\.\/ScrollableTable['"]/g;
    if (tableRegex.test(content)) {
      content = content.replace(tableRegex, `from '@/components/ui/ScrollableTable'`);
      modified = true;
    }

    // Fix other sibling components if any are remaining as `./` but were actually moved.
    // Like `./ReportedTeams` -> `@/components/admin/ReportedTeams` 
    // We only moved specific loose files, so they should now use `@/components/folder/X`
    
    // Oh wait! Some org components might import from '../utils/xxx'.
    // `../utils` become `../../utils` or `@/utils`
    const utilsRegex = /from\s+['"]\.\.\/utils\/([^'"]+)['"]/g;
    if (utilsRegex.test(content)) {
      content = content.replace(utilsRegex, `from '@/utils/$1'`);
      modified = true;
    }
    
    // `../hooks`
    const hooksRegex = /from\s+['"]\.\.\/hooks\/([^'"]+)['"]/g;
    if (hooksRegex.test(content)) {
      content = content.replace(hooksRegex, `from '@/hooks/$1'`);
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated local dependencies for ${path.basename(filePath)}`);
    }
  }
});
console.log('Cleanup Done!');