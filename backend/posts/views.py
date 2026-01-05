# posts/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Post, Category
from .serializers import PostSerializer, PostCreateSerializer, CategorySerializer
from .services.feed_service import get_user_feed

class PostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        username = self.request.query_params.get('username', None)
        if username:
            return Post.objects.filter(user__username=username).select_related('user').order_by('-created_at')
        
        user = self.request.user if self.request.user.is_authenticated else None
        return get_user_feed(user)
    
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