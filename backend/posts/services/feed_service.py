from django.db.models import F, ExpressionWrapper, FloatField, Exists, OuterRef, Value, Count, BooleanField
from django.db.models.functions import Extract, Ln
from django.utils import timezone
from ..models import Post
from users.models import Follow


def get_user_feed(user=None, category_slug=None):
    now = timezone.now()

    queryset = Post.objects.filter(status='ready').select_related('user', 'category')

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

    if category_slug and category_slug not in ['all', 'other']:
        queryset = queryset.filter(category__slug=category_slug)

    queryset = queryset.annotate(
        comment_count=Count('comments'),
        age_hours=ExpressionWrapper(
            (Value(now.timestamp()) - Extract(F('created_at'), 'epoch')) / 3600.0,
            output_field=FloatField()
        ),
        feed_score=ExpressionWrapper(
            (F('total_score') + 1.0) / Ln(F('age_hours') + Value(2.718)),
            output_field=FloatField()
        )
    )

    return queryset.order_by('-feed_score', '-created_at')