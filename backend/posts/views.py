# posts/views.py
import logging

from django.shortcuts import get_object_or_404
from django.db.models import F

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from .models import Post, Category
from .serializers import PostSerializer, PostCreateSerializer, CategorySerializer, PostThumbnailSerializer
from .services.feed_service import get_user_feed
from .services.redis__service import redis_view_tracker
from .utils import get_user_identifier

logger = logging.getLogger(__name__)

class PostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
            # 1. Handle Profile Page (Filtering by user)
            username = self.request.query_params.get('username', None)
            if username:
                return Post.objects.filter(user__username=username).select_related('user').order_by('-created_at')
            
            # 2. Handle Feed (Filtering by Category)
            category_slug = self.request.query_params.get('category', None)
            user = self.request.user if self.request.user.is_authenticated else None
            
            # Pass the category_slug into your service
            return get_user_feed(user, category_slug=category_slug)
        
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
class PostCreateView(generics.CreateAPIView):
    serializer_class = PostCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def perform_create(self, serializer):
        post = serializer.save(user=self.request.user, status='ready')
        
        from users.models import CreatorProfile
        from django.db.models import F
        
        # Get or create the profile
        profile, created = CreatorProfile.objects.get_or_create(user=self.request.user)
        
        # Use F() for atomic increment at database level
        CreatorProfile.objects.filter(user=self.request.user).update(
            work_count=F('work_count') + 1
        )
        
        # Refresh to get the updated value
        profile.refresh_from_db()
        print(f"After increment: work_count = {profile.work_count}")
        
        # Now update leaderboard with the correct work_count
        profile.update_leaderboard_score()
    
    
    
class PostDetailView(generics.RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]
    
    
    
class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all().order_by('order', 'label')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    
    
    
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