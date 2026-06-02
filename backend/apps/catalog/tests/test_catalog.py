import pytest
from apps.catalog.models import Brand, Category, Product
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def manager_user(db):
    return User.objects.create_user(
        email="mgr@test.com", username="mgr", password="pass1234", role="manager"
    )


@pytest.fixture
def analyst_user(db):
    return User.objects.create_user(
        email="analyst@test.com",
        username="analyst",
        password="pass1234",
        role="analyst",
    )


@pytest.fixture
def manager_client(api_client, manager_user):
    resp = api_client.post(
        "/api/v1/auth/login/",
        {"email": "mgr@test.com", "password": "pass1234"},
        format="json",
    )
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
    return api_client


@pytest.fixture
def analyst_client(api_client, analyst_user):
    resp = api_client.post(
        "/api/v1/auth/login/",
        {"email": "analyst@test.com", "password": "pass1234"},
        format="json",
    )
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
    return api_client


@pytest.fixture
def category(db):
    return Category.objects.create(name="Electronics", slug="electronics")


@pytest.fixture
def brand(db):
    return Brand.objects.create(name="Sony")


@pytest.fixture
def product(db, category, brand, manager_user):
    return Product.objects.create(
        sku="SKU-001",
        name="Sony Headphones",
        price="99.99",
        inventory_count=50,
        marketplace="amazon",
        category=category,
        brand=brand,
        created_by=manager_user,
    )


# ── Product CRUD ───────────────────────────────────────────────────────────────


@pytest.mark.django_db
def test_list_products_authenticated(analyst_client, product):
    resp = analyst_client.get("/api/v1/catalog/products/")
    assert resp.status_code == 200
    assert resp.data["count"] >= 1


@pytest.mark.django_db
def test_list_products_unauthenticated(api_client, product):
    resp = api_client.get("/api/v1/catalog/products/")
    assert resp.status_code == 401


@pytest.mark.django_db
def test_create_product_as_manager(manager_client, category, brand):
    payload = {
        "sku": "NEW-001",
        "name": "New Laptop",
        "price": "999.00",
        "inventory_count": 10,
        "marketplace": "shopify",
        "category_id": str(category.id),
        "brand_id": str(brand.id),
    }
    resp = manager_client.post("/api/v1/catalog/products/", payload, format="json")
    assert resp.status_code == 201
    assert resp.data["sku"] == "NEW-001"


@pytest.mark.django_db
def test_create_product_as_analyst_forbidden(analyst_client, category):
    payload = {
        "sku": "BAD-001",
        "name": "Bad Product",
        "price": "10.00",
        "inventory_count": 1,
        "marketplace": "other",
    }
    resp = analyst_client.post("/api/v1/catalog/products/", payload, format="json")
    assert resp.status_code == 403


@pytest.mark.django_db
def test_delete_product_as_manager(manager_client, product):
    resp = manager_client.delete(f"/api/v1/catalog/products/{product.id}/")
    assert resp.status_code == 204
    assert not Product.objects.filter(pk=product.id).exists()


# ── Filtering ──────────────────────────────────────────────────────────────────


@pytest.mark.django_db
def test_filter_by_marketplace(analyst_client, product):
    resp = analyst_client.get("/api/v1/catalog/products/?marketplace=amazon")
    assert resp.status_code == 200
    assert all(p["marketplace"] == "amazon" for p in resp.data["results"])


@pytest.mark.django_db
def test_filter_low_stock(analyst_client, db, manager_user, category):
    Product.objects.create(
        sku="LOW-001",
        name="Low Stock Item",
        price="5.00",
        inventory_count=2,
        marketplace="other",
        created_by=manager_user,
        category=category,
    )
    resp = analyst_client.get("/api/v1/catalog/products/?low_stock=true")
    assert resp.status_code == 200
    assert all(p["inventory_count"] < 10 for p in resp.data["results"])


@pytest.mark.django_db
def test_search_by_name(analyst_client, product):
    resp = analyst_client.get("/api/v1/catalog/products/?search=Sony")
    assert resp.status_code == 200
    assert any("Sony" in p["name"] for p in resp.data["results"])


# ── Inventory update ───────────────────────────────────────────────────────────


@pytest.mark.django_db
def test_update_inventory(manager_client, product):
    resp = manager_client.post(
        f"/api/v1/catalog/products/{product.id}/update_inventory/",
        {"new_count": 100, "change_reason": "Restock"},
        format="json",
    )
    assert resp.status_code == 200
    product.refresh_from_db()
    assert product.inventory_count == 100


@pytest.mark.django_db
def test_inventory_history_recorded(manager_client, product):
    manager_client.post(
        f"/api/v1/catalog/products/{product.id}/update_inventory/",
        {"new_count": 25, "change_reason": "Test"},
        format="json",
    )
    resp = manager_client.get(
        f"/api/v1/catalog/products/{product.id}/inventory_history/"
    )
    assert resp.status_code == 200
    assert len(resp.data) >= 1
    assert resp.data[0]["new_count"] == 25
