from flask import Blueprint, current_app, jsonify

from app.models import Customer, Order, Product

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


@dashboard_bp.route("/summary", methods=["GET"])
def summary():
    threshold = current_app.config["LOW_STOCK_THRESHOLD"]

    low_stock = Product.query.filter(Product.stock_qty <= threshold).order_by(Product.stock_qty).all()

    return jsonify({
        "total_products": Product.query.count(),
        "total_customers": Customer.query.count(),
        "total_orders": Order.query.count(),
        "low_stock_threshold": threshold,
        "low_stock_products": [p.to_dict() for p in low_stock],
    }), 200
