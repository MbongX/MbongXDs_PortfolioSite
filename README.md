# Mbongeni Mahlangu - Portfolio Website

A modern, responsive portfolio website showcasing Mbongeni Mahlangu's skills, experience, and projects. The website features a sleek design with a subtle Matrix-inspired animation in the background.

## ✨ Features

- 🚀 Responsive design that works on all devices
- 🎨 Modern UI with smooth animations and transitions
- 🔮 Interactive Matrix-style background animation
- 📱 Mobile-first approach with optimized performance
- 📂 Project showcase with detailed modals
- 📧 Contact form functionality
- 🌐 Deployable to Azure Static Web Apps

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Build Tools**: npm, clean-css, Terser
- **Deployment**: Azure Static Web Apps
- **Version Control**: Git & GitHub

## 📋 Prerequisites

- Node.js 18.x or higher
- npm 8.x or higher
- (Optional) Azure CLI for deployment

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/MbongX/MbongXDs_PortfolioSite.git
   cd MbongXDs_PortfolioSite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 🏗️ Building for Production

To create a production build:

```bash
npm run build
```

This will:
- Clean the build directory
- Copy static assets
- Minify CSS and JavaScript
- Generate source maps

## 🚀 Deployment

The site is configured for deployment to Azure Static Web Apps. To deploy:

1. Push your changes to the main branch
2. Azure will automatically build and deploy the site

## 🏗️ Project Structure

```
MbongX's_PortSite/
├── .github/                    # GitHub workflows for CI/CD
├── api/                        # Azure Functions API
├── public/                     # Production build output
│   ├── static/                 # Minified assets
│   └── templates/              # HTML templates
├── scripts/                    # Build scripts
├── static/                     # Source static files
│   ├── css/                    # Source CSS
│   └── js/                     # Source JavaScript
├── templates/                  # Source HTML templates
├── .gitignore
├── 404.html
├── README.md
├── app.py                     # Flask application (legacy)
├── build.js                   # Build configuration
├── dev-server.js              # Development server
├── host.json                  # Azure Functions host config
├── local.settings.json        # Local development settings
├── package.json               # Node.js dependencies
└── staticwebapp.config.json   # Azure Static Web Apps config
```

## 🛠️ Development Scripts

- `npm start` - Start the development server
- `npm run build` - Create a production build
- `npm run dev` - Start dev server with hot-reload
- `npm run clean` - Clean build directory
- `npm run minify:css` - Minify CSS files
- `npm run minify:js` - Minify JavaScript files

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Matrix animation inspired by various open-source implementations
- Icons from [Font Awesome](https://fontawesome.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)

```
mbongenimahlangu-portfolio/
├── app.py                # Main Flask application
├── requirements.txt      # Python dependencies
├── README.md             # This file
├── static/               # Static files (CSS, JS, images)
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   └── js/
│       ├── main.js       # Main JavaScript file
│       └── matrix.js     # Matrix animation effect
└── templates/            # HTML templates
    ├── base.html         # Base template
    └── index.html        # Main page
```

## Customization

### Updating Content

1. **Personal Information**: Update the content in `templates/index.html` to reflect your personal information, experience, and projects.

2. **Styling**: Customize the colors, fonts, and layout in `static/css/style.css`.

3. **Matrix Animation**: Adjust the animation settings in `static/js/matrix.js`:
   - `text`: Characters to use in the animation
   - `fontSize`: Size of the characters
   - `textColor`: Color of the characters (default: '#00ff41' - Matrix green)
   - `opacity`: Opacity of the animation (default: 0.1)
   - `speed`: Speed of the animation (default: 1.5)

### Adding New Sections

1. Add a new section in `templates/index.html` within the `<main>` tag.
2. Style the new section in `static/css/style.css`.
3. Add any necessary JavaScript functionality in `static/js/main.js`.

## Deployment

### Deploying to PythonAnywhere

1. Create a free account on [PythonAnywhere](https://www.pythonanywhere.com/)
2. Upload your project files
3. Set up a new web app with Flask
4. Configure the WSGI file to point to your app
5. Reload your web app

### Deploying to Heroku

1. Install the Heroku CLI and login
2. Create a `Procfile` with:
   ```
   web: gunicorn app:app
   ```
3. Run:
   ```bash
   heroku create
   git push heroku main
   heroku open
   ```

## License

This project is open source and available under the [MIT License](LICENSE).

---

Designed and developed by Mbongeni Mahlangu
