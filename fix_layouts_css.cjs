const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Fix Layouts
const layoutsDir = path.join(srcDir, 'layouts');
if (fs.existsSync(layoutsDir)) {
    const layoutFiles = fs.readdirSync(layoutsDir);
    for (const file of layoutFiles) {
        if (file.endsWith('.jsx')) {
            const p = path.join(layoutsDir, file);
            let content = fs.readFileSync(p, 'utf8');
            content = content.replace(/\.\.\/components\//g, '../components/common/');
            fs.writeFileSync(p, content);
        }
    }
}

// Find all css files
const cssPaths = {};
const walkSync = (dir, filelist = []) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const dirFile = path.join(dir, file);
        if (fs.statSync(dirFile).isDirectory()) {
            filelist = walkSync(dirFile, filelist);
        } else {
            filelist.push(dirFile);
        }
    }
    return filelist;
};

const allFiles = walkSync(srcDir);
for (const file of allFiles) {
    if (file.endsWith('.css')) {
        const name = path.basename(file);
        cssPaths[name] = file.replace(srcDir + path.sep, '').replace(/\\/g, '/');
    }
}

// Fix missing css imports in portals and auth
for (const file of allFiles) {
    if (file.endsWith('.jsx')) {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;

        content = content.replace(/import\s+['"]\.\/(.*\.css)['"]/g, (match, cssName) => {
            if (cssPaths[cssName]) {
                // Determine relative path from file to css file
                const fileDir = path.dirname(file).replace(srcDir + path.sep, '').replace(/\\/g, '/');
                const cssDir = path.dirname(path.join(srcDir, cssPaths[cssName])).replace(srcDir + path.sep, '').replace(/\\/g, '/');
                
                if (fileDir !== cssDir) {
                    // Need to calculate relative path
                    const fromParts = fileDir.split('/');
                    const toParts = cssDir.split('/');
                    // For depth 2 to depth 2 (e.g. portals/admin to portals/seller)
                    // fileDir: portals/admin, cssDir: portals/seller
                    // relative: ../seller/Name.css
                    let relPath = path.relative(path.dirname(file), path.join(srcDir, cssPaths[cssName])).replace(/\\/g, '/');
                    if (!relPath.startsWith('.')) {
                        relPath = './' + relPath;
                    }
                    modified = true;
                    return `import '${relPath}'`;
                }
            }
            return match;
        });
        
        // Also fix ../components/ to ../../components/common in case anything was missed
        if (content.includes('../components/') && (file.includes('portals') || file.includes('auth'))) {
            // Already handled, wait, we might have missed depth 2 if regex failed
        }

        if (modified) {
            fs.writeFileSync(file, content);
        }
    }
}
