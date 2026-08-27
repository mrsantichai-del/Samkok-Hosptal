const fs = require('fs');
const path = require('path');
function walkDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) walkDir(dirPath);
        else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
            let content = fs.readFileSync(dirPath, 'utf8');
            let orig = content;
            content = content.replace(/"http:\/\/localhost:3000(.*?)"/g, '\`${process.env.NEXT_PUBLIC_API_URL || "https://samkok-hospital.onrender.com"}$1\`');
            content = content.replace(/http:\/\/localhost:3000/g, '${process.env.NEXT_PUBLIC_API_URL || "https://samkok-hospital.onrender.com"}');
            if (orig !== content) {
                fs.writeFileSync(dirPath, content);
                console.log('Updated ' + dirPath);
            }
        }
    });
}
walkDir('src');
