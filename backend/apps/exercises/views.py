from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Exercise
from .serializers import ExerciseSerializer


class ExerciseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Exercise.objects.prefetch_related("questions").all()
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]
