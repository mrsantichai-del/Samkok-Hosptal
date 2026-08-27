const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) walkDir(dirPath);
        else if ((f.endsWith('.tsx') || f.endsWith('.ts')) && !dirPath.includes('src/lib/config.ts')) {
            let content = fs.readFileSync(dirPath, 'utf8');
            if (content.includes('http://localhost:3000')) {
                // Add import if not present
                if (!content.includes('API_URL')) {
                    content = 'import { API_URL } from "@/lib/config";\n' + content;
                }
                
                // Replace double quotes strings
                content = content.replace(/"http:\/\/localhost:3000(.*?)"/g, '`${API_URL}$1`');
                
                // Replace in template literals
                content = content.replace(/http:\/\/localhost:3000/g, '${API_URL}');
                
                fs.writeFileSync(dirPath, content);
                console.log('Updated ' + dirPath);
            }
        }
    });
}
walkDir('src');
