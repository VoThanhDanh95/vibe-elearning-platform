from rest_framework import serializers
from .models import UserAnswer


class UserAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAnswer
        fields = [
            "id", "question", "content", "status",
            "created_at", "updated_at", "submitted_at",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at", "submitted_at"]


class UserAnswerWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAnswer
        fields = ["question", "content"]

    def validate_content(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Content must be a JSON object.")
        if value and value.get("type") != "doc":
            raise serializers.ValidationError(
                "Content must be a valid Tiptap document with type 'doc'."
            )
        return value

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        obj, _ = UserAnswer.objects.update_or_create(
            user=validated_data["user"],
            question=validated_data["question"],
            defaults={"content": validated_data["content"]},
        )
        return obj

    def update(self, instance, validated_data):
        instance.content = validated_data.get("content", instance.content)
        instance.save(update_fields=["content", "updated_at"])
        return instance
