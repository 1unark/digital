from django.urls import path
from .views import PostListView, PostCreateView, PostDetailView, CategoryListAPIView,TrackPostViewAPI
from django.conf import settings
from django.conf.urls.static import static
from .views import UserVideosView

urlpatterns = [
    path('', PostListView.as_view(), name='post-list'),
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),
    path('create/', PostCreateView.as_view(), name='post-create'),
    path('<uuid:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('<uuid:pk>/track-view/', TrackPostViewAPI.as_view(), name='track-post-view'),
    path('user/<uuid:user_id>/thumbnails/', UserVideosView.as_view(), name='user-thumbnails'),
    
]