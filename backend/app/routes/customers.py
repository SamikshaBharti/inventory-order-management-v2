from flask import Blueprint, jsonify, request

from app import db
from app.models import Customer
from app.validators import require_fields

customers_bp = Blueprint("customers", __name__, url_prefix="/customers")


@customers_bp.route("", methods=["POST"])
def create_customer():
    data = request.get_json(silent=True)
    missing = require_fields(data, ["full_name", "email", "phone"])
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    email = data["email"].strip().lower()
    if Customer.query.filter_by(email=email).first():
        return jsonify({"error": "A customer with this email already exists"}), 409

    customer = Customer(
        full_name=data["full_name"].strip(),
        email=email,
        phone=data["phone"].strip(),
    )
    db.session.add(customer)
    db.session.commit()
    return jsonify(customer.to_dict()), 201


@customers_bp.route("", methods=["GET"])
def list_customers():
    customers = Customer.query.order_by(Customer.id).all()
    return jsonify([c.to_dict() for c in customers]), 200


@customers_bp.route("/<int:customer_id>", methods=["GET"])
def get_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404
    return jsonify(customer.to_dict()), 200


@customers_bp.route("/<int:customer_id>", methods=["DELETE"])
def delete_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    if customer.orders:
        return jsonify({"error": "Cannot delete customer who has existing orders"}), 400

    db.session.delete(customer)
    db.session.commit()
    return jsonify({"message": "Customer deleted successfully"}), 200
