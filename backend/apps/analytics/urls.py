from django.urls import path

from .views import (AIUsageAnalyticsView, DashboardAnalyticsView,
                    InventoryDashboardView)

urlpatterns = [
    path("dashboard/", DashboardAnalyticsView.as_view(), name="analytics-dashboard"),
    path("inventory/", InventoryDashboardView.as_view(), name="analytics-inventory"),
    path("ai-usage/", AIUsageAnalyticsView.as_view(), name="analytics-ai-usage"),
]
