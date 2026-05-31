import os

from flask import Flask, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from app.config import Config

db = SQLAlchemy()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)

    frontend_url = os.getenv("FRONTEND_URL", "").rstrip("/")
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]
    if frontend_url:
        allowed_origins.append(frontend_url)
    CORS(app, origins=allowed_origins)

    from app.routes.products import products_bp
    from app.routes.customers import customers_bp
    from app.routes.orders import orders_bp
    from app.routes.dashboard import dashboard_bp

    app.register_blueprint(products_bp)
    app.register_blueprint(customers_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(dashboard_bp)

    @app.route("/")
    def root():
        return {
            "service": "StockFlow API",
            "status": "running",
            "health": "/health",
        }, 200

    @app.route("/health")
    def health():
        return {"status": "ok"}, 200

    def init_database():
        with app.app_context():
            db.create_all()
            app.logger.info("Database tables ready")

    # Run DB setup once on first request (avoids crashing gunicorn at startup)
    @app.before_request
    def setup_db_once():
        if request.path in ("/", "/health"):
            return
        if not app.config.get("_DB_INITIALIZED"):
            init_database()
            app.config["_DB_INITIALIZED"] = True

    return app
