import django_filters

from .models import Product


class ProductFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr="icontains")
    sku = django_filters.CharFilter(lookup_expr="icontains")
    category = django_filters.UUIDFilter(field_name="category__id")
    brand = django_filters.UUIDFilter(field_name="brand__id")
    marketplace = django_filters.CharFilter(lookup_expr="exact")
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    low_stock = django_filters.BooleanFilter(method="filter_low_stock")
    min_inventory = django_filters.NumberFilter(
        field_name="inventory_count", lookup_expr="gte"
    )
    max_inventory = django_filters.NumberFilter(
        field_name="inventory_count", lookup_expr="lte"
    )

    def filter_low_stock(self, queryset, name, value):
        if value:
            return queryset.filter(inventory_count__lt=10)
        return queryset

    class Meta:
        model = Product
        fields = [
            "name",
            "sku",
            "category",
            "brand",
            "marketplace",
            "min_price",
            "max_price",
        ]
