import logging

from django.shortcuts import get_object_or_404
from django.db.models import F

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Post, Category, MainCategory
from .serializers import PostSerializer, PostCreateSerializer, CategorySerializer, PostThumbnailSerializer, MainCategorySerializer
from .services.feed_service import get_user_feed
from .services.redis__service import redis_view_tracker
from .utils import get_user_identifier
from users.models import Follow
from django.db.models import Exists, OuterRef, Count, Value
from rest_framework.pagination import CursorPagination

logger = logging.getLogger(__name__)


class PostCursorPagination(CursorPagination):
    page_size = 10
    page_size_query_param = 'limit'
    max_page_size = 50
    ordering = '-feed_score'
    cursor_query_param = 'cursor'


class PostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = PostCursorPagination

    def get_queryset(self):
        username = self.request.query_params.get('username', None)
        main_category_slug = self.request.query_params.get('main_category', None)
        category_slug = self.request.query_params.get('category', None)

        if username:
            queryset = Post.objects.filter(
                user__username=username,
                status='ready'
            ).select_related('user', 'category', 'main_category').prefetch_related('comments').annotate(
                comment_count=Count('comments')
            )

            if main_category_slug and main_category_slug != 'all':
                queryset = queryset.filter(main_category__slug=main_category_slug)

            if category_slug and category_slug != 'all':
                queryset = queryset.filter(category__slug=category_slug)

            if self.request.user.is_authenticated:
                queryset = queryset.annotate(
                    is_following_author=Exists(
                        Follow.objects.filter(
                            user_from=self.request.user,
                            user_to=OuterRef('user_id')
                        )
                    )
                )
            else:
                queryset = queryset.annotate(is_following_author=Value(False))

            return queryset.order_by('-created_at')

        feed = get_user_feed(user=self.request.user, category_slug=category_slug)

        if main_category_slug and main_category_slug != 'all':
            feed = feed.filter(main_category__slug=main_category_slug)

        return feed

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    
from django.utils import timezone
from datetime import timedelta

class PostCreateView(generics.CreateAPIView):
    serializer_class = PostCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Check 24-hour upload limit
        time_threshold = timezone.now() - timedelta(hours=24)
        recent_posts = Post.objects.filter(
            user=request.user,
            created_at__gte=time_threshold
        ).count()
        
        if recent_posts >= 5:
            return Response(
                {"error": "Upload limit reached. You can only upload 5 posts per 24 hours."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def perform_create(self, serializer):
        post = serializer.save(user=self.request.user, status='ready')
        
        from users.models import CreatorProfile
        
        profile, created = CreatorProfile.objects.get_or_create(user=self.request.user)
        
        CreatorProfile.objects.filter(user=self.request.user).update(
            work_count=F('work_count') + 1
        )
        
        profile.refresh_from_db()
        profile.update_leaderboard_score()
    
    
class PostDetailView(generics.RetrieveAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Post.objects.select_related('user', 'category', 'main_category').prefetch_related('comments').annotate(
            comment_count=Count('comments')
        )
        
        if self.request.user.is_authenticated:
            queryset = queryset.annotate(
                is_following_author=Exists(
                    Follow.objects.filter(
                        user_from=self.request.user,
                        user_to=OuterRef('user_id')
                    )
                )
            )
        else:
            queryset = queryset.annotate(is_following_author=Value(False))
        
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    
    
    
class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all().order_by('order', 'label')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    
    def list(self, request, *args, **kwargs):
        categories_response = super().list(request, *args, **kwargs)
        main_categories = MainCategory.objects.all().order_by('order', 'label')
        
        return Response({
            'main_categories': MainCategorySerializer(main_categories, many=True).data,
            'categories': categories_response.data
        })
    
    
class TrackPostViewAPI(APIView):
    """
    API endpoint to track post views with Redis-based cooldown.
    
    POST /posts/<uuid:pk>/track-view/
    
    Tracks a view only if:
    1. The post exists
    2. The user hasn't viewed it in the last 3 hours (configurable)
    
    Returns:
    - 200: View tracked successfully
    - 204: View not tracked (cooldown active)
    - 404: Post not found
    """
    permission_classes = [AllowAny]
    
    def post(self, request, pk):
        # Verify post exists
        post = get_object_or_404(Post, pk=pk)
        
        # Get user identifier
        user_identifier = get_user_identifier(request)
        
        # Try to track the view
        tracked = redis_view_tracker.track_view(str(post.id), user_identifier)
        
        if tracked:
            # Increment view count in database (async recommended for production)
            post.view_count += 1
            post.save(update_fields=['view_count'])
            
            logger.info(f"View tracked: post={post.id}, user={user_identifier}, total_views={post.view_count}")
            
            return Response({
                'status': 'tracked',
                'message': 'View tracked successfully',
                'total_views': post.view_count
            }, status=status.HTTP_200_OK)
        else:
            # Get remaining cooldown time
            remaining = redis_view_tracker.get_remaining_cooldown(str(post.id), user_identifier)
            
            logger.info(f"View not tracked (cooldown): post={post.id}, user={user_identifier}, remaining={remaining}s")
            
            return Response({
                'status': 'cooldown',
                'message': 'View not tracked - cooldown period active',
                'cooldown_remaining_seconds': remaining
            }, status=status.HTTP_204_NO_CONTENT)
    
           
from django.contrib.auth import get_user_model

User = get_user_model()

class UserVideosView(generics.ListAPIView):
    serializer_class = PostThumbnailSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = get_object_or_404(User, id=user_id)
        
        return Post.objects.filter(
            user=user,
            status='ready'
        ).only('id', 'thumbnail', 'view_count').order_by('-created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    
    
class PostDeleteView(generics.DestroyAPIView):
    queryset = Post.objects.all()
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, *args, **kwargs):
        post = self.get_object()
        
        # Check if user is the owner
        if post.user != request.user:
            return Response(
                {"error": "You don't have permission to delete this post"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Decrement work count
        from users.models import CreatorProfile
        profile, created = CreatorProfile.objects.get_or_create(user=request.user)
        
        if profile.work_count > 0:
            CreatorProfile.objects.filter(user=request.user).update(
                work_count=F('work_count') - 1
            )
            profile.refresh_from_db()
            profile.update_leaderboard_score()
        
        # Files are automatically deleted by the post_delete signal
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)