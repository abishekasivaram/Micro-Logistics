const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Map of page names to their new directories (relative to src)
const pageToDir = {};
const mapPages = (dir, subpath) => {
    const fullPath = path.join(dir, subpath);
    if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        for (const file of files) {
            if (file.endsWith('.jsx')) {
                pageToDir[file.replace('.jsx', '')] = subpath;
            }
        }
    }
};

mapPages(srcDir, 'portals/admin');
mapPages(srcDir, 'portals/customer');
mapPages(srcDir, 'portals/seller');
mapPages(srcDir, 'auth');

// 1. Update App.jsx
const appJsxPath = path.join(srcDir, 'App.jsx');
if (fs.existsSync(appJsxPath)) {
    let appContent = fs.readFileSync(appJsxPath, 'utf8');
    appContent = appContent.replace(/import\s+(.*?)\s+from\s+['"]\.\/pages\/(.*?)['"]/g, (match, p1, p2) => {
        const componentName = p2;
        const newDir = pageToDir[componentName];
        if (newDir) {
            return `import ${p1} from './${newDir}/${componentName}'`;
        }
        return match;
    });
    // Update component imports in App.jsx
    appContent = appContent.replace(/import\s+(.*?)\s+from\s+['"]\.\/components\/(.*?)['"]/g, "import $1 from './components/common/$2'");
    fs.writeFileSync(appJsxPath, appContent);
}

// 2. Update Layouts, Context, Components (depth 1 to depth 2 or 3)
const updateFileImports = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let text = content;
    
    // Check if the file is in depth 2 (auth or portals or components/common)
    if (filePath.includes('portals') || filePath.includes('auth') || filePath.includes('components\\common') || filePath.includes('components/common')) {
        const dirs = ['layouts', 'context', 'data', 'utils', 'styles', 'assets'];
        for (const d of dirs) {
            text = text.replace(new RegExp(`\\.\\.\\/${d}\\/`, 'g'), `../../${d}/`);
        }
        
        // Components: ../components/ -> ../../components/common/
        text = text.replace(/\.\.\/components\//g, '../../components/common/');
        
        // Cross-page imports: ../pages/something -> ../../newpath/something
        // The old path was ../pages/ or ./ (if same folder in pages)
        // Let's replace ../pages/
        text = text.replace(/\.\.\/pages\/(.*?)(['"])/g, (match, p1, p2) => {
            const dest = pageToDir[p1.split('/')[0].replace('.jsx', '')];
            if (dest) {
                return `../../${dest}/${p1}${p2}`;
            }
            return match;
        });

        // if the file was in pages and imported a sibling: import from './SomePage'
        // we can't easily resolve without knowing what they are. 
        // We'll see if build fails and fix manually.
    }

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

const allFiles = walkSync(srcDir);
for (const file of allFiles) {
    if (file !== appJsxPath) {
        updateFileImports(file);
    }
}
