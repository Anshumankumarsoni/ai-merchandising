import logging

from django.utils.text import slugify

from .models import Brand, Category, Product
from .repositories import InventoryLogRepository, ProductRepository

logger = logging.getLogger(__name__)


class ProductService:
    @staticmethod
    def create_product(data: dict, user) -> Product:
        product = ProductRepository.create(data, user)
        logger.info("Product created: %s by %s", product.sku, user.email)
        return product

    @staticmethod
    def update_product(product: Product, data: dict) -> Product:
        return ProductRepository.update(product, data)

    @staticmethod
    def delete_product(product: Product) -> None:
        ProductRepository.delete(product)
        logger.info("Product deleted: %s", product.sku)

    @staticmethod
    def update_inventory(
        product: Product, new_count: int, reason: str, user
    ) -> Product:
        previous = product.inventory_count
        InventoryLogRepository.create(product, previous, new_count, reason, user)
        product.inventory_count = new_count
        product.save(update_fields=["inventory_count"])
        logger.info(
            "Inventory updated for %s: %d → %d by %s",
            product.sku,
            previous,
            new_count,
            user.email,
        )
        return product


class CategoryService:
    @staticmethod
    def create_category(name: str, parent_id=None) -> Category:
        slug = slugify(name)
        # Ensure slug is unique
        base_slug, counter = slug, 1
        while Category.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        return Category.objects.create(name=name, slug=slug, parent_id=parent_id)


class BrandService:
    @staticmethod
    def create_brand(name: str, website: str = "") -> Brand:
        return Brand.objects.create(name=name, website=website)
