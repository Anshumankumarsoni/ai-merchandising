from django.utils import timezone


class TimestampMixin:
    """Auto-sets created_at and updated_at on save."""

    def save(self, *args, **kwargs):
        if not self.pk:
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)
