from common.validators import (validate_non_negative_inventory,
                               validate_positive_price, validate_sku)
from rest_framework import serializers

from .models import Brand, Category, InventoryLog, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "parent", "created_at")
        read_only_fields = ("id", "created_at")


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "name", "website", "created_at")
        read_only_fields = ("id", "created_at")


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    brand_name = serializers.CharField(source="brand.name", read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "sku",
            "name",
            "category_name",
            "brand_name",
            "price",
            "inventory_count",
            "is_low_stock",
            "marketplace",
            "created_at",
        )


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    category_id = serializers.UUIDField(
        write_only=True, required=False, allow_null=True
    )
    brand_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "sku",
            "name",
            "description",
            "category",
            "category_id",
            "brand",
            "brand_id",
            "price",
            "inventory_count",
            "is_low_stock",
            "marketplace",
            "created_by_email",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_sku(self, value):
        return validate_sku(value)

    def validate_price(self, value):
        return validate_positive_price(value)

    def validate_inventory_count(self, value):
        return validate_non_negative_inventory(value)


class InventoryUpdateSerializer(serializers.Serializer):
    new_count = serializers.IntegerField(validators=[validate_non_negative_inventory])
    change_reason = serializers.CharField(
        max_length=300, required=False, allow_blank=True
    )


class InventoryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryLog
        fields = (
            "id",
            "product",
            "previous_count",
            "new_count",
            "change_reason",
            "created_at",
        )
        read_only_fields = ("id", "previous_count", "created_at")
