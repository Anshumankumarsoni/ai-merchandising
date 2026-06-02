import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("catalog", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="AIAnalysis",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, editable=False, primary_key=True
                    ),
                ),
                (
                    "analysis_type",
                    models.CharField(
                        choices=[
                            ("description", "Description Generation"),
                            ("classification", "Product Classification"),
                            ("review", "Review Analysis"),
                            ("listing_quality", "Listing Quality"),
                        ],
                        max_length=50,
                    ),
                ),
                ("input_data", models.JSONField()),
                ("output_data", models.JSONField(blank=True, null=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Pending"),
                            ("processing", "Processing"),
                            ("completed", "Completed"),
                            ("failed", "Failed"),
                        ],
                        default="pending",
                        max_length=20,
                    ),
                ),
                ("error_message", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("completed_at", models.DateTimeField(null=True, blank=True)),
                (
                    "product",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="ai_analyses",
                        to="catalog.product",
                    ),
                ),
                (
                    "requested_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"db_table": "ai_analyses"},
        ),
        migrations.AddIndex(
            model_name="aianalysis",
            index=models.Index(
                fields=["product", "analysis_type"], name="ai_prod_type_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="aianalysis",
            index=models.Index(fields=["status"], name="ai_status_idx"),
        ),
        migrations.AddIndex(
            model_name="aianalysis",
            index=models.Index(fields=["created_at"], name="ai_created_idx"),
        ),
    ]
