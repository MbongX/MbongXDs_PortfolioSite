# Mbongeni Mahlangu - Portfolio Website

A modern, responsive portfolio website showcasing Mbongeni Mahlangu's skills, experience, and projects. The website features a sleek design with a subtle Matrix-inspired animation in the background.

## Features

- Responsive design that works on all devices
- Modern UI with smooth animations and transitions
- Matrix-style background animation
- Sections for About, Experience, Projects, and Contact
- Easy to customize and extend

## Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mbongenimahlangu-portfolio.git
   cd mbongenimahlangu-portfolio
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. Start the Flask development server:
   ```bash
   python app.py
   ```

2. Open your web browser and navigate to:
   ```
   http://127.0.0.1:5000/
   ```

## Project Structure

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
