from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "sentiment_score", "created_at")
    list_filter = ("sentiment_score",)
    search_fields = ("product__name", "content")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)
