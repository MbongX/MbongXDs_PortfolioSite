const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Create public directories if they don't exist
const publicJsDir = path.join(__dirname, '..', 'public', 'static', 'js');
if (!fs.existsSync(publicJsDir)) {
    fs.mkdirSync(publicJsDir, { recursive: true });
}

// Function to check if a file exists
const fileExists = (filePath) => {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
};

// Copy JavaScript files
const filesToCopy = [
    { 
        src: 'static/js/project-modal.js', 
        dest: 'public/static/js/project-modal.js',
        required: true
    },
    { 
        src: 'static/js/main.js', 
        dest: 'public/static/js/main.js',
        required: true
    }
];

console.log('Copying JavaScript files...');
filesToCopy.forEach(({ src, dest, required }) => {
    try {
        if (fileExists(src)) {
            fs.copyFileSync(src, dest);
            console.log(`✅ Copied ${src} to ${dest}`);
        } else if (required) {
            throw new Error(`Required file not found: ${src}`);
        } else {
            console.log(`⚠️  Skipping optional file: ${src}`);
        }
    } catch (error) {
        console.error(`❌ Error processing ${src}:`, error.message);
        if (required) {
            console.error('❌ Build failed due to missing required file');
            process.exit(1);
        }
    }
});

// Get list of files that were successfully copied
const filesToMinify = filesToCopy
    .filter(({ dest }) => fileExists(dest))
    .map(({ dest }) => dest);

console.log('\nMinifying JavaScript files...');
filesToMinify.forEach(file => {
    const minFile = file.replace(/\.js$/, '.min.js');
    try {
        execSync(`npx terser ${file} -c -m -o ${minFile}`, { stdio: 'inherit' });
        console.log(`✅ Minified ${file} to ${minFile}`);
    } catch (error) {
        console.error(`❌ Error minifying ${file}:`, error.message);
        process.exit(1);
    }
});

console.log('\n✅ Build process completed successfully!');
