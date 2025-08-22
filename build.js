/**
 * Build script for production deployment
 * Minifies and optimizes static assets
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure the build directory exists
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Run the build process
console.log('Starting build process...');

try {
  // Install dependencies if needed
  console.log('Installing dependencies...');
  execSync('npm install --no-package-lock', { stdio: 'inherit' });

  // Run the build script from package.json
  console.log('Running build...');
  execSync('npm run build', { stdio: 'inherit' });

  // Update index.html to use minified assets
  console.log('Updating asset references...');
  const indexPath = path.join(buildDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Update CSS reference
    content = content.replace(
      /<link[^>]*href=["'](\/static\/css\/style\.css)["'][^>]*>/,
      '<link rel="stylesheet" href="/static/css/style.min.css">'
    );
    
    // Update JS references
    const jsFiles = ['matrix.js', 'main.js', 'project-modal.js', 'mouse-trail-new.js'];
    jsFiles.forEach(jsFile => {
      const regex = new RegExp(`<script[^>]*src=["'](\/static\/js\/${jsFile.replace('.', '\.')})["'][^>]*><\/script>`, 'g');
      content = content.replace(regex, '');
    });
    
    // Add minified JS bundle
    content = content.replace(
      '</body>',
      '    <script src="/static/js/app.min.js"></script>\n</body>'
    );
    
    fs.writeFileSync(indexPath, content, 'utf8');
  }

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
