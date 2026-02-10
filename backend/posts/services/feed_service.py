from datetime import timedelta
from django.db.models import F, ExpressionWrapper, FloatField, Exists, OuterRef, Value, Count, BooleanField, Q
from django.db.models.functions import Extract, Ln
from django.utils import timezone
from ..models import Post
from users.models import Follow
from django.db.models import Case, When



def get_user_feed(user=None, category_slug=None):
    now = timezone.now()
    
    # Last 7 days
    seven_days_ago = now - timedelta(days=7)
    
    # Get top post from the last 7 days
    top_post_id = (
        Post.objects.filter(
            status='ready',
            created_at__gte=seven_days_ago,
        )
        .order_by('-total_score', 'created_at')
        .values_list('id', flat=True)
        .first()
    )


    # Build main queryset with category filter
    queryset = Post.objects.filter(status='ready').select_related('user', 'category')

    if category_slug and category_slug not in ['all', 'other']:
        if top_post_id:
            queryset = queryset.filter(Q(category__slug=category_slug) | Q(id=top_post_id))
        else:
            queryset = queryset.filter(category__slug=category_slug)

    queryset = queryset.annotate(
        comment_count=Count('comments'),
        age_hours=ExpressionWrapper(
            (Value(now.timestamp()) - Extract(F('created_at'), 'epoch')) / 3600.0,
            output_field=FloatField()
        ),
        feed_score=ExpressionWrapper(
            (F('total_score') + 1.0) / Ln(F('age_hours') + Value(0.8)),
            output_field=FloatField()
        )
    )

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

    queryset = queryset.annotate(
        is_top_weekly=Case(
            When(id=top_post_id, then=Value(True)),
            default=Value(False),
            output_field=BooleanField()
        )
    )
    
    return queryset.order_by('-is_top_weekly', '-feed_score', '-created_at')