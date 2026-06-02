import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Brand",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, editable=False, primary_key=True
                    ),
                ),
                ("name", models.CharField(max_length=200, unique=True)),
                ("website", models.URLField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"db_table": "brands"},
        ),
        migrations.CreateModel(
            name="Category",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, editable=False, primary_key=True
                    ),
                ),
                ("name", models.CharField(max_length=200, unique=True)),
                ("slug", models.SlugField(max_length=200, unique=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "parent",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="children",
                        to="catalog.category",
                    ),
                ),
            ],
            options={"db_table": "categories", "verbose_name_plural": "categories"},
        ),
        migrations.CreateModel(
            name="Product",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, editable=False, primary_key=True
                    ),
                ),
                ("sku", models.CharField(db_index=True, max_length=100, unique=True)),
                ("name", models.CharField(max_length=500)),
                ("description", models.TextField(blank=True)),
                ("price", models.DecimalField(decimal_places=2, max_digits=12)),
                ("inventory_count", models.IntegerField(default=0)),
                (
                    "marketplace",
                    models.CharField(
                        choices=[
                            ("amazon", "Amazon"),
                            ("ebay", "eBay"),
                            ("shopify", "Shopify"),
                            ("walmart", "Walmart"),
                            ("etsy", "Etsy"),
                            ("other", "Other"),
                        ],
                        default="other",
                        max_length=50,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "brand",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="products",
                        to="catalog.brand",
                    ),
                ),
                (
                    "category",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="products",
                        to="catalog.category",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="products",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"db_table": "products"},
        ),
        migrations.CreateModel(
            name="InventoryLog",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, editable=False, primary_key=True
                    ),
                ),
                ("previous_count", models.IntegerField()),
                ("new_count", models.IntegerField()),
                ("change_reason", models.CharField(blank=True, max_length=300)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "changed_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "product",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="inventory_logs",
                        to="catalog.product",
                    ),
                ),
            ],
            options={"db_table": "inventory_logs"},
        ),
        migrations.AddIndex(
            model_name="category",
            index=models.Index(fields=["slug"], name="cat_slug_idx"),
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(fields=["sku"], name="prod_sku_idx"),
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(fields=["name"], name="prod_name_idx"),
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(fields=["marketplace"], name="prod_market_idx"),
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(fields=["inventory_count"], name="prod_inv_idx"),
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(fields=["created_at"], name="prod_created_idx"),
        ),
        migrations.AddIndex(
            model_name="inventorylog",
            index=models.Index(
                fields=["product", "created_at"], name="invlog_prod_idx"
            ),
        ),
    ]
