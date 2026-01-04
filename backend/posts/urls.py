from django.urls import path
from .views import PostListView, PostCreateView, PostDetailView
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('', PostListView.as_view(), name='post-list'),
    path('create/', PostCreateView.as_view(), name='post-create'),
    path('<int:pk>/', PostDetailView.as_view(), name='post-detail'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)