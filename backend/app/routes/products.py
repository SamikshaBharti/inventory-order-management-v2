from flask import Blueprint, jsonify, request

from app import db
from app.models import Product
from app.validators import parse_positive_int, parse_positive_number, require_fields

products_bp = Blueprint("products", __name__, url_prefix="/products")


@products_bp.route("", methods=["POST"])
def create_product():
    data = request.get_json(silent=True)
    missing = require_fields(data, ["name", "sku", "price", "quantity_in_stock"])
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    try:
        price = parse_positive_number(data["price"], "price")
        stock = parse_positive_int(data["quantity_in_stock"], "quantity_in_stock")
    except ValueError as err:
        return jsonify({"error": str(err)}), 400

    if Product.query.filter_by(sku=data["sku"]).first():
        return jsonify({"error": "A product with this SKU already exists"}), 409

    product = Product(
        name=data["name"].strip(),
        sku=data["sku"].strip(),
        price=price,
        stock_qty=stock,
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_dict()), 201


@products_bp.route("", methods=["GET"])
def list_products():
    products = Product.query.order_by(Product.id).all()
    return jsonify([p.to_dict() for p in products]), 200


@products_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product.to_dict()), 200


@products_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    if "sku" in data and data["sku"] != product.sku:
        existing = Product.query.filter_by(sku=data["sku"]).first()
        if existing:
            return jsonify({"error": "A product with this SKU already exists"}), 409
        product.sku = data["sku"].strip()

    if "name" in data:
        product.name = data["name"].strip()

    if "price" in data:
        try:
            product.price = parse_positive_number(data["price"], "price")
        except ValueError as err:
            return jsonify({"error": str(err)}), 400

    if "quantity_in_stock" in data:
        try:
            product.stock_qty = parse_positive_int(data["quantity_in_stock"], "quantity_in_stock")
        except ValueError as err:
            return jsonify({"error": str(err)}), 400

    db.session.commit()
    return jsonify(product.to_dict()), 200


@products_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted successfully"}), 200
