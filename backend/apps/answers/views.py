from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import UserAnswer
from .serializers import UserAnswerSerializer, UserAnswerWriteSerializer


class UserAnswerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        qs = UserAnswer.objects.filter(user=self.request.user)
        question_id = self.request.query_params.get("question")
        if question_id:
            qs = qs.filter(question_id=question_id)
        return qs

    def get_serializer_class(self):
        if self.action in ("create", "partial_update"):
            return UserAnswerWriteSerializer
        return UserAnswerSerializer

    @action(detail=True, methods=["post"], url_path="submit")
    def submit(self, request, pk=None):
        answer = get_object_or_404(UserAnswer, pk=pk, user=request.user)
        if answer.status == UserAnswer.Status.SUBMITTED:
            return Response(
                {"detail": "Already submitted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not answer.content:
            return Response(
                {"detail": "Cannot submit an empty answer."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        answer.submit()
        return Response(UserAnswerSerializer(answer).data)
