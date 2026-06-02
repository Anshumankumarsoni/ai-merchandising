from django.db import migrations


class Migration(migrations.Migration):
    """
    Analytics app has no models of its own - it aggregates from other apps.
    This empty migration satisfies Django's migration framework.
    """

    initial = True
    dependencies = [
        ("catalog", "0001_initial"),
        ("ai_tools", "0001_initial"),
    ]

    operations = []
