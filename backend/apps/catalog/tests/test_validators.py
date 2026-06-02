import pytest
from rest_framework import serializers
from common.validators import (
    validate_non_negative_inventory,
    validate_positive_price,
    validate_sku,
)


class TestValidateSKU:
    def test_valid_sku_uppercase(self):
        assert validate_sku("SKU-001") == "SKU-001"

    def test_lowercases_converted(self):
        assert validate_sku("sku-001") == "SKU-001"

    def test_underscore_allowed(self):
        assert validate_sku("SKU_001") == "SKU_001"

    def test_spaces_rejected(self):
        with pytest.raises(serializers.ValidationError):
            validate_sku("SKU 001")

    def test_special_chars_rejected(self):
        with pytest.raises(serializers.ValidationError):
            validate_sku("SKU@001!")


class TestValidatePositivePrice:
    def test_positive_price_passes(self):
        assert validate_positive_price(9.99) == 9.99

    def test_zero_rejected(self):
        with pytest.raises(serializers.ValidationError):
            validate_positive_price(0)

    def test_negative_rejected(self):
        with pytest.raises(serializers.ValidationError):
            validate_positive_price(-1)


class TestValidateNonNegativeInventory:
    def test_zero_allowed(self):
        assert validate_non_negative_inventory(0) == 0

    def test_positive_allowed(self):
        assert validate_non_negative_inventory(100) == 100

    def test_negative_rejected(self):
        with pytest.raises(serializers.ValidationError):
            validate_non_negative_inventory(-1)
