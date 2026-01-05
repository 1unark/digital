from django.db.models import Q
from ..models import Post

def get_user_feed(user=None, category_slug=None, username=None):
    # 1. Base Queryset (The Algorithm)
    if username:
        # User Profile Feed
        queryset = Post.objects.filter(user__username=username)
    elif user and user.is_authenticated:
        # The 'Algorithm': Following + maybe some suggested
        # Adjust 'following' to your actual related_name
        following_ids = user.following.values_list('to_user_id', flat=True)
        queryset = Post.objects.filter(user_id__in=following_ids)
    else:
        # Discovery Feed (Everyone)
        queryset = Post.objects.all()

    # 2. Add Category Filter (The 'Sort')
    # If 'all', we don't filter by category
    if category_slug and category_slug != 'all':
        queryset = queryset.filter(category__slug=category_slug)

    # 3. Final polish (Performance & Ordering)
    return queryset.select_related('user', 'category').order_by('-created_at')