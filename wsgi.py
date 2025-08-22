""
WSGI config for production.
"""
import os
from app import create_app

app = create_app('config_prod.ProductionConfig')

if __name__ == "__main__":
    app.run()
