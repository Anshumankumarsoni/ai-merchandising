from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import AIUsageService, DashboardService, InventoryService


class DashboardAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Analytics"])
    def get(self, request):
        return Response(DashboardService.get_summary())


class InventoryDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Analytics"])
    def get(self, request):
        return Response(InventoryService.get_dashboard())


class AIUsageAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Analytics"])
    def get(self, request):
        return Response({"by_type": AIUsageService.get_usage_by_type()})
