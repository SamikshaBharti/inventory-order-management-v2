import os


def _database_url():
    """Render/Railway often provide postgres:// — SQLAlchemy needs postgresql://"""
    url = os.getenv(
        "DATABASE_URL",
        "postgresql://inventory_user:inventory_pass@db:5432/inventory_db",
    )
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    # SSL only for external Render URLs (not internal dpg-xxxxx-a hostnames)
    if ".render.com" in url and "sslmode=" not in url:
        separator = "&" if "?" in url else "?"
        url = f"{url}{separator}sslmode=require"
    return url


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
    SQLALCHEMY_DATABASE_URI = _database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }
    LOW_STOCK_THRESHOLD = int(os.getenv("LOW_STOCK_THRESHOLD", "10"))
