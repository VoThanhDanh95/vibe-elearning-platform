from django.contrib import admin
from .models import UserAnswer


@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    list_display = ["user", "question", "status", "updated_at", "submitted_at"]
    list_filter = ["status"]
    readonly_fields = ["id", "created_at", "updated_at", "submitted_at"]
