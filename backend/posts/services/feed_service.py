from django.db.models import Q, Exists, OuterRef
from ..models import Post
from users.models import Follow


def get_user_feed(user=None, category_slug=None):
    # Start with all ready posts
    queryset = Post.objects.filter(status='ready').select_related('user', 'category')
    
    # Annotate is_following for authenticated users (single subquery)
    if user and user.is_authenticated:
        queryset = queryset.annotate(
            is_following_author=Exists(
                Follow.objects.filter(
                    user_from=user,
                    user_to=OuterRef('user_id')
                )
            )
        )
    else:
        # Add False annotation for consistency
        queryset = queryset.annotate(
            is_following_author=False
        )
    
    # If the user clicked a category in the sidebar
    if category_slug and category_slug != 'all':
        queryset = queryset.filter(category__slug=category_slug)
    
    # Apply your scoring/ranking logic
    queryset = queryset.order_by('-total_score', '-created_at')
    
    return queryset