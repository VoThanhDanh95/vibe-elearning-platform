from django.db import models


class Exercise(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "exercises"

    def __str__(self):
        return self.title


class Question(models.Model):
    class QuestionType(models.TextChoices):
        RICH_TEXT = "rich_text", "Rich Text"
        MULTIPLE_CHOICE = "multiple_choice", "Multiple Choice"
        SHORT_ANSWER = "short_answer", "Short Answer"

    exercise = models.ForeignKey(
        Exercise, on_delete=models.CASCADE, related_name="questions"
    )
    prompt = models.TextField()
    question_type = models.CharField(
        max_length=30,
        choices=QuestionType.choices,
        default=QuestionType.RICH_TEXT,
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "questions"
        ordering = ["order"]

    def __str__(self):
        return f"Q{self.order}: {self.prompt[:50]}"
