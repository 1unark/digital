from django.db.models import Q
from ..models import Post

def get_user_feed(user=None, category_slug=None):
    # Start with all ready posts
    queryset = Post.objects.filter(status='ready').select_related('user', 'category')
    
    # If the user clicked a category in the sidebar
    if category_slug and category_slug != 'all':
        queryset = queryset.filter(category__slug=category_slug)
    
    # Apply your scoring/ranking logic
    # (Example: ordering by score and date)
    queryset = queryset.order_by('-total_score', '-created_at')
    
    return queryset