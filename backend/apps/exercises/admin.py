from django.contrib import admin
from .models import Exercise, Question


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ["title", "created_at"]
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["exercise", "question_type", "order"]
    list_filter = ["question_type", "exercise"]
