"""
Build script for production deployment.
Minifies and optimizes static assets.
"""
import os
import shutil
from pathlib import Path
import subprocess

def clean_build_dir():
    """Remove existing build directory and create a fresh one."""
    build_dir = Path('build')
    if build_dir.exists():
        shutil.rmtree(build_dir)
    build_dir.mkdir()

def copy_static_files():
    """Copy and optimize static files to build directory."""
    # Copy all static files
    shutil.copytree('static', 'build/static', dirs_exist_ok=True)
    
    # Copy root files
    for file in ['index.html', 'favicon.ico', 'robots.txt', 'sitemap.xml']:
        if os.path.exists(file):
            shutil.copy2(file, 'build/')

def install_dependencies():
    """Install required Node.js dependencies for building."""
    if not os.path.exists('node_modules'):
        subprocess.run(['npm', 'install', '--no-package-lock'], check=True)

def minify_assets():
    """Minify CSS and JavaScript files."""
    try:
        # Minify CSS
        subprocess.run([
            'npx', 'cleancss', 
            '--output', 'build/static/css/style.min.css',
            'static/css/style.css'
        ], check=True)
        
        # Minify JavaScript files
        for js_file in ['matrix.js', 'main.js', 'project-modal.js']:
            if os.path.exists(f'static/js/{js_file}'):
                subprocess.run([
                    'npx', 'terser',
                    f'static/js/{js_file}',
                    '--compress', '--mangle',
                    '--output', f'build/static/js/{js_file}'
                ], check=True)
    except Exception as e:
        print(f"Warning: Could not minify assets: {e}")
        # Fallback to copying non-minified files
        shutil.copytree('static', 'build/static', dirs_exist_ok=True)

def update_html_references():
    """Update HTML files to reference minified assets."""
    for root, _, files in os.walk('templates'):
        for file in files:
            if file.endswith('.html'):
                with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace CSS references
                content = content.replace(
                    'href="static/css/style.css"',
                    'href="static/css/style.min.css"'
                )
                
                # Replace JS references
                for js_file in ['matrix.js', 'main.js', 'project-modal.js']:
                    content = content.replace(
                        f'src="static/js/{js_file}"',
                        f'src="static/js/{js_file}"'
                    )
                
                # Write updated content to build directory
                output_path = os.path.join('build', os.path.relpath(root, 'templates'))
                os.makedirs(output_path, exist_ok=True)
                with open(os.path.join(output_path, file), 'w', encoding='utf-8') as f:
                    f.write(content)

def main():
    print("Starting build process...")
    
    print("Cleaning build directory...")
    clean_build_dir()
    
    print("Installing build dependencies...")
    install_dependencies()
    
    print("Copying and optimizing static files...")
    copy_static_files()
    
    print("Minifying assets...")
    minify_assets()
    
    print("Updating HTML references...")
    update_html_references()
    
    print("Build completed successfully!")

if __name__ == "__main__":
    main()
