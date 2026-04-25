from rest_framework.routers import DefaultRouter
from .views import UserAnswerViewSet

router = DefaultRouter()
router.register("answers", UserAnswerViewSet, basename="answers")

urlpatterns = router.urls
