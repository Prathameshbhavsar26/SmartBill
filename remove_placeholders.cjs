const fs = require('fs');
const path = require('path');

const srcDir = path.join('d:', 'Business Management Dashboard (2)', 'Business Management Dashboard', 'src');
const excludeFile = 'AuthScreen.jsx';

const regex = /\s+placeholder\s*=\s*(?:"[^"]*"|'[^']*'|\{[\s\S]*?\})/g;

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            if (file === excludeFile) continue;
            
            const content = fs.readFileSync(fullPath, 'utf-8');
            const newContent = content.replace(regex, '');
            
            if (newContent !== content) {
                fs.writeFileSync(fullPath, newContent, 'utf-8');
                console.log('Updated ' + file);
            }
        }
    }
}

walkDir(srcDir);
