"""
Production configuration settings
"""
import os
from datetime import timedelta

class ProductionConfig:
    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'  # Change in production
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(days=30)
    
    # Performance
    JSONIFY_PRETTYPRINT_REGULAR = False
    JSON_SORT_KEYS = False
    
    # Static files
    SEND_FILE_MAX_AGE_DEFAULT = 31536000  # 1 year in seconds
    
    # Disable debug
    DEBUG = False
    TESTING = False
    
    # Logging
    LOG_LEVEL = 'WARNING'
    
    # Security Headers
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_SSL_REDIRECT = True
    X_FRAME_OPTIONS = 'SAMEORIGIN'
    X_CONTENT_TYPE_OPTIONS = 'nosniff'
    X_XSS_PROTECTION = '1; mode=block'
