"""Small helpers for validating incoming JSON data."""


def require_fields(data, fields):
    """Return a list of missing field names, or empty list if all present."""
    if not data:
        return list(fields)
    return [f for f in fields if f not in data or data[f] in (None, "")]


def parse_positive_number(value, field_name):
    """Convert value to float; raise ValueError with a readable message."""
    try:
        number = float(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be a valid number")
    if number < 0:
        raise ValueError(f"{field_name} cannot be negative")
    return number


def parse_positive_int(value, field_name):
    """Convert value to int; raise ValueError with a readable message."""
    try:
        number = int(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be a valid whole number")
    if number < 0:
        raise ValueError(f"{field_name} cannot be negative")
    return number
