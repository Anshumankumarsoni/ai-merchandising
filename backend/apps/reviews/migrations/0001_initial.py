import uuid

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("catalog", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Review",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, editable=False, primary_key=True
                    ),
                ),
                ("content", models.TextField()),
                ("sentiment_score", models.FloatField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "product",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reviews",
                        to="catalog.product",
                    ),
                ),
            ],
            options={"db_table": "reviews"},
        ),
        migrations.AddIndex(
            model_name="review",
            index=models.Index(
                fields=["product", "created_at"], name="review_prod_idx"
            ),
        ),
    ]
