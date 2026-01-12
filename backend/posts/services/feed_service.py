from django.db.models import F, ExpressionWrapper, FloatField, Q, Exists, OuterRef, Value, Count, BooleanField
from django.db.models.functions import Cast, Extract
from django.utils import timezone
from ..models import Post
from users.models import Follow


def get_user_feed(user=None, category_slug=None):
    now = timezone.now()
    
    # Start with ready posts
    queryset = Post.objects.filter(status='ready').select_related('user', 'category')
    
    # Annotate following status
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
        queryset = queryset.annotate(
            is_following_author=Value(False, output_field=BooleanField())
        )
    
    # Category filter - exclude 'other' and 'all'
    # Posts with NULL category or 'other' category only appear in 'all'
    if category_slug and category_slug not in ['all', 'other']:
        queryset = queryset.filter(category__slug=category_slug)
    # If category is 'other' or 'all', show all posts including NULL categories
    
    queryset = queryset.annotate(comment_count=Count('comments'))

    queryset = queryset.annotate(
        age_penalty=ExpressionWrapper(
            (Value(now.timestamp()) - Extract(F('created_at'), 'epoch')) / 3600.0,
            output_field=FloatField()
        ),
        feed_score=ExpressionWrapper(
            (F('total_score') + 1.0) / ((F('age_penalty') + 2.0) ** 1.5),
            output_field=FloatField()
        )
    )
    
    return queryset.order_by('-feed_score', '-created_at')