from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db.models import Count, Exists, OuterRef
from .models import Comment
from .serializers import CommentSerializer, CommentCreateSerializer, CommentUpdateSerializer
from users.models import Follow


class CommentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None  # Disable pagination for comments
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateSerializer
        return CommentSerializer
    
    def get_queryset(self):
        post_id = self.request.query_params.get('post_id')
        parent_id = self.request.query_params.get('parent_id')
        
        # Base queryset with optimizations
        queryset = Comment.objects.select_related('user', 'post').annotate(
            reply_count=Count('replies')
        )
        
        # Annotate is_following for authenticated users
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
            queryset = queryset.annotate(is_following_author=False)
        
        # Filter by post (top-level comments only by default)
        if post_id:
            if parent_id:
                # Get replies to a specific comment
                queryset = queryset.filter(parent_id=parent_id)
            else:
                # Get top-level comments for a post
                queryset = queryset.filter(post_id=post_id, parent__isnull=True)
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save()
        
        # Return the full comment data with annotations
        comment_queryset = Comment.objects.filter(pk=comment.pk).select_related('user', 'post').annotate(
            reply_count=Count('replies')
        )
        
        if request.user.is_authenticated:
            comment_queryset = comment_queryset.annotate(
                is_following_author=Exists(
                    Follow.objects.filter(
                        user_from=request.user,
                        user_to=OuterRef('user_id')
                    )
                )
            )
        else:
            comment_queryset = comment_queryset.annotate(is_following_author=False)
        
        output_serializer = CommentSerializer(comment_queryset.first(), context={'request': request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.select_related('user', 'post')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CommentUpdateSerializer
        return CommentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset().annotate(
            reply_count=Count('replies')
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
            queryset = queryset.annotate(is_following_author=False)
        
        return queryset
    
    def perform_update(self, serializer):
        comment = self.get_object()
        if comment.user != self.request.user:
            raise PermissionDenied("You can only edit your own comments")
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own comments")
        instance.delete()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context