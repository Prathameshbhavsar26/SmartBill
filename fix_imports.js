import fs from 'fs';
import path from 'path';

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/["']\.\.\/\.\.\/\.\.\/components\//g, '"@shared/components/');
    content = content.replace(/["']\.\.\/\.\.\/components\//g, '"@shared/components/');
    content = content.replace(/["']\.\.\/components\//g, '"@shared/components/');
    
    content = content.replace(/["']\.\.\/\.\.\/\.\.\/api\//g, '"@shared/api/');
    content = content.replace(/["']\.\.\/\.\.\/api\//g, '"@shared/api/');
    content = content.replace(/["']\.\.\/api\//g, '"@shared/api/');
    content = content.replace(/["']\.\.\/api\//g, '"@shared/api/');

    content = content.replace(/["']\.\.\/\.\.\/utils\//g, '"@shared/utils/');
    content = content.replace(/["']\.\.\/utils\//g, '"@shared/utils/');

    content = content.replace(/["']\.\.\/\.\.\/hooks\//g, '"@shared/hooks/');
    content = content.replace(/["']\.\.\/hooks\//g, '"@shared/hooks/');

    content = content.replace(/["']\.\.\/\.\.\/context\//g, '"@shared/context/');
    content = content.replace(/["']\.\.\/context\//g, '"@shared/context/');

    content = content.replace(/["']\.\.\/\.\.\/layouts\//g, '"@shared/layouts/');
    content = content.replace(/["']\.\.\/layouts\//g, '"@shared/layouts/');
    content = content.replace(/["']\.\/layouts\//g, '"@shared/layouts/');

    content = content.replace(/["']\.\.\/\.\.\/constants\//g, '"@shared/constants/');
    content = content.replace(/["']\.\.\/constants\//g, '"@shared/constants/');

    content = content.replace(/["']\.\/components\//g, '"@shared/components/');
    content = content.replace(/["']\.\/utils\//g, '"@shared/utils/');
    content = content.replace(/["']\.\/hooks\//g, '"@shared/hooks/');

    // Add trailing semicolon or anything missing? Just regex string replacements.

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${filePath}`);
    }
}

function traverse(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist') traverse(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            fixImportsInFile(fullPath);
        }
    });
}

traverse(path.join(process.cwd(), 'apps'));
traverse(path.join(process.cwd(), 'shared'));
