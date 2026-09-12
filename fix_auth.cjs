const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const updateAuthImports = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let text = content;
    
    // Auth is depth 1, we incorrectly turned ../ into ../../
    text = text.replace(/\.\.\/\.\.\//g, '../');
    
    if (text !== content) {
        fs.writeFileSync(filePath, text);
    }
};

const walkSync = (dir, filelist = []) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const dirFile = path.join(dir, file);
        if (fs.statSync(dirFile).isDirectory()) {
            filelist = walkSync(dirFile, filelist);
        } else if (dirFile.endsWith('.jsx') || dirFile.endsWith('.js') || dirFile.endsWith('.css')) {
            filelist.push(dirFile);
        }
    }
    return filelist;
};

const authFiles = walkSync(path.join(srcDir, 'auth'));
for (const file of authFiles) {
    updateAuthImports(file);
}
