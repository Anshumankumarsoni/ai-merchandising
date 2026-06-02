"""
Reusable Django REST Framework field validators.
"""

import re

from rest_framework import serializers


def validate_sku(value: str) -> str:
    """SKU must be alphanumeric with optional hyphens/underscores."""
    if not re.match(r"^[A-Za-z0-9_\-]+$", value):
        raise serializers.ValidationError(
            "SKU may only contain letters, numbers, hyphens, and underscores."
        )
    return value.upper()


def validate_positive_price(value) -> float:
    if value <= 0:
        raise serializers.ValidationError("Price must be greater than zero.")
    return value


def validate_non_negative_inventory(value: int) -> int:
    if value < 0:
        raise serializers.ValidationError("Inventory count cannot be negative.")
    return value
