from django.urls import path
from .views import VoteCreateView, VoteDeleteView

urlpatterns = [
    path('<int:post_id>/', VoteCreateView.as_view(), name='vote-create'),
    path('<int:post_id>/delete/', VoteDeleteView.as_view(), name='vote-delete'),
]