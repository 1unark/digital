# votes/urls.py
from django.urls import path
from .views import VoteCreateView, VoteDeleteView

urlpatterns = [
    path('<uuid:post_id>/', VoteCreateView.as_view(), name='vote-create'),
    path('<uuid:post_id>/delete/', VoteDeleteView.as_view(), name='vote-delete'),
]