"""
Simple build script for Azure Static Web Apps
"""
import os
import shutil

def main():
    print("Starting build process...")
    
    # Create build directory structure
    os.makedirs('build/static/css', exist_ok=True)
    os.makedirs('build/static/js', exist_ok=True)
    
    # Copy static files
    print("Copying static files...")
    if os.path.exists('static'):
        shutil.copytree('static', 'build/static', dirs_exist_ok=True)
    
    # Copy root files
    print("Copying root files...")
    for file in ['index.html', '404.html', 'favicon.ico', 'robots.txt', 'sitemap.xml']:
        if os.path.exists(file):
            shutil.copy2(file, 'build/')
    
    # Copy templates
    print("Copying templates...")
    if os.path.exists('templates'):
        shutil.copytree('templates', 'build/templates', dirs_exist_ok=True)
    
    print("Build completed successfully!")

if __name__ == "__main__":
    main()
