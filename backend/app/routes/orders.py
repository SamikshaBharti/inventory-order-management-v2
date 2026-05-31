from decimal import Decimal

from flask import Blueprint, jsonify, request

from app import db
from app.models import Customer, Order, OrderItem, Product
from app.validators import parse_positive_int, require_fields

orders_bp = Blueprint("orders", __name__, url_prefix="/orders")


@orders_bp.route("", methods=["POST"])
def create_order():
    data = request.get_json(silent=True)
    missing = require_fields(data, ["customer_id", "items"])
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    if not isinstance(data["items"], list) or len(data["items"]) == 0:
        return jsonify({"error": "Order must include at least one product item"}), 400

    customer = Customer.query.get(data["customer_id"])
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    order = Order(customer_id=customer.id, total_amount=Decimal("0.00"))
    db.session.add(order)
    db.session.flush()

    running_total = Decimal("0.00")

    for index, item in enumerate(data["items"]):
        item_missing = require_fields(item, ["product_id", "quantity"])
        if item_missing:
            return jsonify({"error": f"Item {index + 1} missing: {', '.join(item_missing)}"}), 400

        try:
            qty = parse_positive_int(item["quantity"], "quantity")
        except ValueError as err:
            return jsonify({"error": str(err)}), 400

        if qty == 0:
            return jsonify({"error": "Order quantity must be greater than zero"}), 400

        product = Product.query.get(item["product_id"])
        if not product:
            return jsonify({"error": f"Product id {item['product_id']} not found"}), 404

        if product.stock_qty < qty:
            db.session.rollback()
            return jsonify({
                "error": f"Not enough stock for '{product.name}'. Available: {product.stock_qty}, requested: {qty}"
            }), 400

        unit_price = Decimal(str(product.price))
        line_total = unit_price * qty
        running_total += line_total

        product.stock_qty -= qty

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            unit_price=unit_price,
            line_total=line_total,
        )
        db.session.add(order_item)

    order.total_amount = running_total
    db.session.commit()
    return jsonify(order.to_dict()), 201


@orders_bp.route("", methods=["GET"])
def list_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200


@orders_bp.route("/<int:order_id>", methods=["GET"])
def get_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    return jsonify(order.to_dict()), 200


@orders_bp.route("/<int:order_id>", methods=["DELETE"])
def cancel_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    if order.status == "cancelled":
        return jsonify({"error": "Order is already cancelled"}), 400

    for item in order.items:
        product = Product.query.get(item.product_id)
        if product:
            product.stock_qty += item.quantity

    order.status = "cancelled"
    db.session.commit()
    return jsonify({"message": "Order cancelled and stock restored", "order": order.to_dict()}), 200
