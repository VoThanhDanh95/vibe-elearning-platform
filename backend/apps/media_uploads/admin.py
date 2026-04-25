from django.contrib import admin
from .models import MediaUpload


@admin.register(MediaUpload)
class MediaUploadAdmin(admin.ModelAdmin):
    list_display = ["original_filename", "file_type", "mime_type", "size_bytes", "uploaded_by", "created_at"]
    readonly_fields = ["id", "url", "created_at"]
