from rest_framework import serializers
from .models import Exercise, Question


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ["id", "prompt", "question_type", "order"]


class ExerciseSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Exercise
        fields = ["id", "title", "description", "questions", "created_at"]
