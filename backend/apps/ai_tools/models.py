import uuid

from django.conf import settings
from django.db import models


class AIAnalysis(models.Model):
    class AnalysisType(models.TextChoices):
        DESCRIPTION = "description", "Description Generation"
        CLASSIFICATION = "classification", "Product Classification"
        REVIEW = "review", "Review Analysis"
        LISTING_QUALITY = "listing_quality", "Listing Quality"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        "catalog.Product",
        on_delete=models.CASCADE,
        related_name="ai_analyses",
        null=True,
        blank=True,
    )
    analysis_type = models.CharField(max_length=50, choices=AnalysisType.choices)
    input_data = models.JSONField()
    output_data = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    error_message = models.TextField(blank=True)
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "ai_analyses"
        indexes = [
            models.Index(fields=["product", "analysis_type"]),
            models.Index(fields=["status"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.analysis_type} — {self.status}"
