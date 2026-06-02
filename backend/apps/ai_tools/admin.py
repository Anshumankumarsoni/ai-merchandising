from django.contrib import admin

from .models import AIAnalysis


@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "analysis_type",
        "status",
        "product",
        "requested_by",
        "created_at",
    )
    list_filter = ("analysis_type", "status")
    search_fields = ("product__name", "product__sku")
    readonly_fields = ("created_at", "completed_at", "input_data", "output_data")
    ordering = ("-created_at",)
