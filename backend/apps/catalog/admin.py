from django.contrib import admin

from .models import Brand, Category, InventoryLog, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent", "created_at")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "website", "created_at")
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "sku",
        "name",
        "category",
        "brand",
        "price",
        "inventory_count",
        "marketplace",
        "created_at",
    )
    list_filter = ("marketplace", "category", "brand")
    search_fields = ("sku", "name")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)


@admin.register(InventoryLog)
class InventoryLogAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "previous_count",
        "new_count",
        "change_reason",
        "changed_by",
        "created_at",
    )
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)
