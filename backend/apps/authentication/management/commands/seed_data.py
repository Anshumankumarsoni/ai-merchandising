"""
Management command: seed_data
Populates the database with realistic sample data for development/demo.

Usage:
    python manage.py seed_data
    python manage.py seed_data --products 50
    python manage.py seed_data --clear
"""
import random
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.catalog.models import Brand, Category, Product
from apps.reviews.models import Review

User = get_user_model()

CATEGORIES = [
    "Electronics", "Clothing & Apparel", "Home & Garden", "Sports & Outdoors",
    "Books & Media", "Health & Beauty", "Toys & Games", "Automotive",
    "Food & Grocery", "Office Supplies",
]

BRANDS = [
    ("Sony", "https://sony.com"), ("Apple", "https://apple.com"),
    ("Samsung", "https://samsung.com"), ("Nike", "https://nike.com"),
    ("Adidas", "https://adidas.com"), ("Amazon Basics", "https://amazon.com"),
    ("Anker", "https://anker.com"), ("Logitech", "https://logitech.com"),
]

SAMPLE_PRODUCTS = [
    ("Wireless Noise Cancelling Headphones", "Electronics", "Sony", "amazon", 299.99),
    ("Running Shoes Pro", "Sports & Outdoors", "Nike", "shopify", 129.99),
    ("Smart Watch Series 8", "Electronics", "Apple", "amazon", 399.99),
    ("Ergonomic Office Chair", "Home & Garden", "Amazon Basics", "amazon", 249.99),
    ("USB-C Hub 7-in-1", "Electronics", "Anker", "ebay", 45.99),
    ("Yoga Mat Premium", "Sports & Outdoors", "Adidas", "shopify", 79.99),
    ("Mechanical Keyboard RGB", "Electronics", "Logitech", "amazon", 159.99),
    ("Vitamin D3 Supplement", "Health & Beauty", "Amazon Basics", "walmart", 12.99),
    ("Bluetooth Speaker Portable", "Electronics", "Sony", "amazon", 89.99),
    ("Running Shorts Dry-Fit", "Clothing & Apparel", "Nike", "shopify", 34.99),
]

SAMPLE_REVIEWS = [
    "Excellent product, exactly what I needed!",
    "Great value for the price. Would buy again.",
    "Battery life is outstanding, very pleased.",
    "Arrived quickly and well packaged.",
    "Good quality but slightly smaller than expected.",
    "Instructions were unclear but product works well.",
    "Best purchase I've made this year!",
    "Quality feels premium. Very satisfied.",
    "Stopped working after 2 weeks. Disappointed.",
    "Customer service was helpful when I had issues.",
]


class Command(BaseCommand):
    help = "Seed the database with sample data for development"

    def add_arguments(self, parser):
        parser.add_argument("--products", type=int, default=20, help="Number of products to create")
        parser.add_argument("--clear", action="store_true", help="Clear existing data before seeding")

    def handle(self, *args, **options):
        if options["clear"]:
            self.stdout.write("Clearing existing data...")
            Review.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            Brand.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()

        self.stdout.write("Creating users...")
        users = self._create_users()

        self.stdout.write("Creating categories...")
        categories = self._create_categories()

        self.stdout.write("Creating brands...")
        brands = self._create_brands()

        self.stdout.write(f"Creating {options['products']} products...")
        products = self._create_products(categories, brands, users, options["products"])

        self.stdout.write("Creating reviews...")
        self._create_reviews(products)

        self.stdout.write(
            self.style.SUCCESS(
                f"\n✅ Seed complete!\n"
                f"   Users:      {len(users)}\n"
                f"   Categories: {len(categories)}\n"
                f"   Brands:     {len(brands)}\n"
                f"   Products:   {len(products)}\n"
            )
        )

    def _create_users(self):
        users = []
        roles_data = [
            ("admin@demo.com", "admin", "Admin", "User", "admin"),
            ("manager@demo.com", "manager", "Manager", "User", "manager"),
            ("analyst@demo.com", "analyst", "Analyst", "User", "analyst"),
        ]
        for email, username, first, last, role in roles_data:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": username,
                    "first_name": first,
                    "last_name": last,
                    "role": role,
                    "is_staff": role == "admin",
                },
            )
            if created:
                user.set_password("demo1234")
                user.save()
                self.stdout.write(f"  Created user: {email} / demo1234")
            users.append(user)
        return users

    def _create_categories(self):
        categories = []
        for name in CATEGORIES:
            cat, _ = Category.objects.get_or_create(
                name=name, defaults={"slug": slugify(name)}
            )
            categories.append(cat)
        return categories

    def _create_brands(self):
        brands = []
        for name, website in BRANDS:
            brand, _ = Brand.objects.get_or_create(name=name, defaults={"website": website})
            brands.append(brand)
        return brands

    def _create_products(self, categories, brands, users, count):
        products = []
        cat_map = {c.name: c for c in categories}
        brand_map = {b.name: b for b in brands}
        manager = next((u for u in users if u.role == "manager"), users[0])

        # First create the curated sample products
        for name, cat_name, brand_name, marketplace, price in SAMPLE_PRODUCTS:
            sku = f"SKU-{name[:3].upper()}-{random.randint(1000, 9999)}"
            if Product.objects.filter(name=name).exists():
                products.append(Product.objects.get(name=name))
                continue
            p = Product.objects.create(
                sku=sku,
                name=name,
                description=f"High quality {name}. Perfect for everyday use.",
                category=cat_map.get(cat_name),
                brand=brand_map.get(brand_name),
                price=Decimal(str(price)),
                inventory_count=random.randint(0, 200),
                marketplace=marketplace,
                created_by=manager,
            )
            products.append(p)

        # Fill up to requested count with random products
        while len(products) < count:
            cat = random.choice(categories)
            brand = random.choice(brands)
            sku = f"GEN-{random.randint(10000, 99999)}"
            if Product.objects.filter(sku=sku).exists():
                continue
            p = Product.objects.create(
                sku=sku,
                name=f"{brand.name} {cat.name} Product #{random.randint(100, 999)}",
                description=f"A quality product from {brand.name} in the {cat.name} category.",
                category=cat,
                brand=brand,
                price=Decimal(str(round(random.uniform(5, 500), 2))),
                inventory_count=random.randint(0, 300),
                marketplace=random.choice(["amazon", "ebay", "shopify", "walmart", "etsy", "other"]),
                created_by=manager,
            )
            products.append(p)

        return products

    def _create_reviews(self, products):
        for product in random.sample(products, min(len(products), 8)):
            for _ in range(random.randint(2, 5)):
                Review.objects.create(
                    product=product,
                    content=random.choice(SAMPLE_REVIEWS),
                    sentiment_score=round(random.uniform(-1, 1), 2),
                )
