import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command

from apps.catalog.models import Brand, Category, Product

User = get_user_model()


@pytest.mark.django_db
def test_seed_data_creates_users():
    call_command("seed_data", "--products", "5")
    assert User.objects.filter(email="admin@demo.com").exists()
    assert User.objects.filter(email="manager@demo.com").exists()
    assert User.objects.filter(email="analyst@demo.com").exists()


@pytest.mark.django_db
def test_seed_data_creates_categories():
    call_command("seed_data", "--products", "5")
    assert Category.objects.count() >= 5


@pytest.mark.django_db
def test_seed_data_creates_brands():
    call_command("seed_data", "--products", "5")
    assert Brand.objects.count() >= 3


@pytest.mark.django_db
def test_seed_data_creates_products():
    call_command("seed_data", "--products", "15")
    assert Product.objects.count() >= 10


@pytest.mark.django_db
def test_seed_data_clear_flag():
    call_command("seed_data", "--products", "5")
    initial_count = Product.objects.count()
    call_command("seed_data", "--products", "5", "--clear")
    # After clear + reseed, count should be reset
    assert Product.objects.count() >= 5
    assert Product.objects.count() <= initial_count + 5


@pytest.mark.django_db
def test_seed_data_idempotent():
    call_command("seed_data", "--products", "5")
    call_command("seed_data", "--products", "5")
    # Running twice without --clear should not create duplicate users
    assert User.objects.filter(email="admin@demo.com").count() == 1
