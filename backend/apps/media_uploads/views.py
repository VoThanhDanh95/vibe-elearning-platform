import magic
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from .models import MediaUpload

ALLOWED_IMAGE_MIME = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB


class ImageUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response(
                {"detail": "No file provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if file.size > MAX_IMAGE_BYTES:
            return Response(
                {"detail": "File too large. Maximum size is 10 MB."},
                status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )

        mime = magic.from_buffer(file.read(2048), mime=True)
        file.seek(0)

        if mime not in ALLOWED_IMAGE_MIME:
            return Response(
                {"detail": f"Unsupported file type: {mime}. Allowed: JPEG, PNG, GIF, WebP."},
                status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            )

        upload = MediaUpload.objects.create(
            uploaded_by=request.user,
            file=file,
            original_filename=file.name,
            file_type=MediaUpload.FileType.IMAGE,
            mime_type=mime,
            size_bytes=file.size,
        )

        return Response(
            {"url": upload.url, "id": str(upload.id)},
            status=status.HTTP_201_CREATED,
        )
