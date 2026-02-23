const fs = require('fs');
const path = require('path');

const folders = [
    'backend/.esbuild',
    'frontend/.nuxt',
    'frontend/.output'
];

console.log('--- limpiando cache ---');

folders.forEach(folder => {
    const fullPath = path.resolve(__dirname, '..', folder);
    if (fs.existsSync(fullPath)) {
        try {
            console.log(`borrando ${folder}...`);
            fs.rmSync(fullPath, { recursive: true, force: true });
        } catch (err) {
            console.warn(`no se pudo borrar ${folder}: ${err.message}`);
        }
    }
});

console.log('--- limpieza completada ---');
