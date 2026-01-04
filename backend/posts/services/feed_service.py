# feed_service.py
"""
from ..models import Post

def get_user_feed(user=None):
    return Post.objects.filter(status='ready').select_related('user').order_by('-created_at')
"""

from ..models import Post

def get_user_feed(user=None):
    return Post.objects.select_related('user').order_by('-created_at')