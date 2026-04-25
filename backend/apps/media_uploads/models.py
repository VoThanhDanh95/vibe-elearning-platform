import uuid
import os
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


def upload_path(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    return f"uploads/{instance.uploaded_by_id}/{uuid.uuid4()}{ext}"


class MediaUpload(models.Model):
    class FileType(models.TextChoices):
        IMAGE = "image", "Image"
        FILE = "file", "File"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    uploaded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="uploads"
    )
    file = models.FileField(upload_to=upload_path)
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10, choices=FileType.choices)
    mime_type = models.CharField(max_length=100, blank=True)
    size_bytes = models.PositiveBigIntegerField(default=0)
    url = models.URLField(max_length=2048, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "media_uploads"

    def __str__(self):
        return self.original_filename

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.file and not self.url:
            from django.conf import settings as django_settings
            base = django_settings.MEDIA_URL_BASE.rstrip("/")
            self.url = f"{base}/{self.file.name}"
            MediaUpload.objects.filter(pk=self.pk).update(url=self.url)
