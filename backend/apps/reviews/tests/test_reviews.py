import pytest

from tests.factories import ProductFactory, ReviewFactory


@pytest.mark.django_db
def test_list_reviews(analyst_client):
    product = ProductFactory()
    ReviewFactory.create_batch(3, product=product)
    resp = analyst_client.get("/api/v1/reviews/")
    assert resp.status_code == 200
    assert resp.data["count"] >= 3


@pytest.mark.django_db
def test_create_review(analyst_client):
    product = ProductFactory()
    resp = analyst_client.post(
        "/api/v1/reviews/",
        {"product": str(product.id), "content": "Great product, highly recommended!"},
        format="json",
    )
    assert resp.status_code == 201
    assert resp.data["content"] == "Great product, highly recommended!"


@pytest.mark.django_db
def test_reviews_requires_auth(api_client):
    resp = api_client.get("/api/v1/reviews/")
    assert resp.status_code == 401


@pytest.mark.django_db
def test_delete_review(manager_client):
    review = ReviewFactory()
    resp = manager_client.delete(f"/api/v1/reviews/{review.id}/")
    assert resp.status_code == 204
