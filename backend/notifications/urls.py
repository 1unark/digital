# notifications/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, NotificationPreferenceViewSet

router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notification')  # Empty string, not 'notifications'
router.register(r'preferences', NotificationPreferenceViewSet, basename='notification-preference')

urlpatterns = router.urls