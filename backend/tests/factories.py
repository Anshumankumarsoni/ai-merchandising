"""
factory_boy factories for all models.
Use these in tests instead of manual object creation.
"""
import factory
from django.contrib.auth import get_user_model
from factory.django import DjangoModelFactory

from apps.catalog.models import Brand, Category, InventoryLog, Product
from apps.reviews.models import Review
from apps.ai_tools.models import AIAnalysis

User = get_user_model()


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user{n}@test.com")
    username = factory.Sequence(lambda n: f"user{n}")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    role = "analyst"
    is_active = True

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        password = kwargs.pop("password", "testpass123")
        user = model_class(**kwargs)
        user.set_password(password)
        user.save()
        return user


class AdminUserFactory(UserFactory):
    role = "admin"
    is_staff = True


class ManagerUserFactory(UserFactory):
    role = "manager"


class CategoryFactory(DjangoModelFactory):
    class Meta:
        model = Category

    name = factory.Sequence(lambda n: f"Category {n}")
    slug = factory.Sequence(lambda n: f"category-{n}")
    parent = None


class BrandFactory(DjangoModelFactory):
    class Meta:
        model = Brand

    name = factory.Sequence(lambda n: f"Brand {n}")
    website = factory.Faker("url")


class ProductFactory(DjangoModelFactory):
    class Meta:
        model = Product

    sku = factory.Sequence(lambda n: f"SKU-{n:04d}")
    name = factory.Faker("catch_phrase")
    description = factory.Faker("paragraph")
    category = factory.SubFactory(CategoryFactory)
    brand = factory.SubFactory(BrandFactory)
    price = factory.Faker("pydecimal", left_digits=4, right_digits=2, positive=True)
    inventory_count = factory.Faker("random_int", min=0, max=500)
    marketplace = "amazon"
    created_by = factory.SubFactory(ManagerUserFactory)


class LowStockProductFactory(ProductFactory):
    inventory_count = factory.Faker("random_int", min=0, max=9)


class ReviewFactory(DjangoModelFactory):
    class Meta:
        model = Review

    product = factory.SubFactory(ProductFactory)
    content = factory.Faker("paragraph")
    sentiment_score = factory.Faker("pyfloat", min_value=-1, max_value=1)


class AIAnalysisFactory(DjangoModelFactory):
    class Meta:
        model = AIAnalysis

    product = factory.SubFactory(ProductFactory)
    analysis_type = AIAnalysis.AnalysisType.DESCRIPTION
    input_data = {"product_title": "Test Product"}
    output_data = None
    status = AIAnalysis.Status.PENDING
    requested_by = factory.SubFactory(ManagerUserFactory)
