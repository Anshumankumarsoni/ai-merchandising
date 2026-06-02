from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from common.permissions import IsManagerOrAbove

from .filters import ProductFilter
from .models import Brand, Category, Product
from .repositories import BrandRepository, CategoryRepository, InventoryLogRepository, ProductRepository
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    InventoryLogSerializer,
    InventoryUpdateSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)
from .services import BrandService, CategoryService, ProductService


@extend_schema_view(
    list=extend_schema(tags=["Products"]),
    retrieve=extend_schema(tags=["Products"]),
    create=extend_schema(tags=["Products"]),
    update=extend_schema(tags=["Products"]),
    partial_update=extend_schema(tags=["Products"]),
    destroy=extend_schema(tags=["Products"]),
)
class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filterset_class = ProductFilter
    search_fields = ["name", "sku", "description"]
    ordering_fields = ["name", "price", "inventory_count", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return ProductRepository.get_all()

    def get_serializer_class(self):
        if self.action == "list":
            return ProductListSerializer
        return ProductDetailSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsManagerOrAbove()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        serializer = ProductDetailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = ProductService.create_product(serializer.validated_data, request.user)
        return Response(ProductDetailSerializer(product).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        product = self.get_object()
        serializer = ProductDetailSerializer(
            product, data=request.data, partial=kwargs.get("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        updated = ProductService.update_product(product, serializer.validated_data)
        return Response(ProductDetailSerializer(updated).data)

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        ProductService.delete_product(product)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(tags=["Products"], request=InventoryUpdateSerializer)
    @action(detail=True, methods=["post"], permission_classes=[IsManagerOrAbove])
    def update_inventory(self, request, pk=None):
        product = self.get_object()
        serializer = InventoryUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated = ProductService.update_inventory(
            product,
            serializer.validated_data["new_count"],
            serializer.validated_data.get("change_reason", ""),
            request.user,
        )
        return Response(ProductDetailSerializer(updated).data)

    @extend_schema(tags=["Products"])
    @action(detail=True, methods=["get"])
    def inventory_history(self, request, pk=None):
        product = self.get_object()
        logs = InventoryLogRepository.get_for_product(product)
        return Response(InventoryLogSerializer(logs, many=True).data)


@extend_schema_view(
    list=extend_schema(tags=["Categories"]),
    create=extend_schema(tags=["Categories"]),
)
class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    search_fields = ["name"]
    ordering = ["name"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsManagerOrAbove()]
        return super().get_permissions()

    def perform_create(self, serializer):
        CategoryService.create_category(
            serializer.validated_data["name"],
            serializer.validated_data.get("parent"),
        )


@extend_schema_view(
    list=extend_schema(tags=["Brands"]),
    create=extend_schema(tags=["Brands"]),
)
class BrandViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BrandSerializer
    queryset = Brand.objects.all()
    search_fields = ["name"]
    ordering = ["name"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsManagerOrAbove()]
        return super().get_permissions()
