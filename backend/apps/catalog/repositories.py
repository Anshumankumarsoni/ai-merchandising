from django.db.models import QuerySet

from .models import Brand, Category, InventoryLog, Product


class ProductRepository:
    @staticmethod
    def get_all() -> QuerySet:
        return Product.objects.select_related("category", "brand", "created_by").all()

    @staticmethod
    def get_by_id(product_id) -> Product:
        return Product.objects.select_related("category", "brand").get(pk=product_id)

    @staticmethod
    def create(data: dict, user) -> Product:
        data["created_by"] = user
        return Product.objects.create(**data)

    @staticmethod
    def update(product: Product, data: dict) -> Product:
        for key, value in data.items():
            setattr(product, key, value)
        product.save()
        return product

    @staticmethod
    def delete(product: Product) -> None:
        product.delete()

    @staticmethod
    def get_low_stock(threshold: int = 10) -> QuerySet:
        return (
            Product.objects.filter(inventory_count__lt=threshold)
            .select_related("category", "brand")
            .order_by("inventory_count")
        )


class CategoryRepository:
    @staticmethod
    def get_all() -> QuerySet:
        return Category.objects.all()

    @staticmethod
    def get_by_id(category_id) -> Category:
        return Category.objects.get(pk=category_id)


class BrandRepository:
    @staticmethod
    def get_all() -> QuerySet:
        return Brand.objects.all()

    @staticmethod
    def get_by_id(brand_id) -> Brand:
        return Brand.objects.get(pk=brand_id)


class InventoryLogRepository:
    @staticmethod
    def create(
        product: Product, previous_count: int, new_count: int, reason: str, user
    ) -> InventoryLog:
        return InventoryLog.objects.create(
            product=product,
            previous_count=previous_count,
            new_count=new_count,
            change_reason=reason,
            changed_by=user,
        )

    @staticmethod
    def get_for_product(product: Product) -> QuerySet:
        return InventoryLog.objects.filter(product=product).order_by("-created_at")
