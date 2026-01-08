from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, UserProfileView, CurrentUserView, CustomTokenObtainPairView,
    LeaderboardView, UpdateProfileView, toggle_follow, FollowingListView, FollowersListView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/<str:username>/', UserProfileView.as_view(), name='user-profile'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('update-profile/<uuid:user_id>/', UpdateProfileView.as_view(), name='update_profile'),
    path('follow/<str:username>/', toggle_follow, name='toggle_follow'),
    path('<str:username>/following/', FollowingListView.as_view(), name='following_list'),
    path('<str:username>/followers/', FollowersListView.as_view(), name='followers_list'),
]