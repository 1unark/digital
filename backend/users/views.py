from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Follow, CreatorProfile
from .serializers import (
    UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer,
    CreatorProfileSerializer, UpdateProfileSerializer, FollowSerializer
)
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count, Exists, OuterRef, Q


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class UserProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'username'
    
    def get_queryset(self):
        queryset = User.objects.annotate(
            follower_count=Count('follower_set', distinct=True),
            following_count=Count('following_set', distinct=True)
        )
        
        if self.request.user.is_authenticated:
            queryset = queryset.annotate(
                is_following=Exists(
                    Follow.objects.filter(
                        user_from=self.request.user,
                        user_to=OuterRef('pk')
                    )
                )
            )
        
        return queryset


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = User.objects.annotate(
            follower_count=Count('follower_set', distinct=True),
            following_count=Count('following_set', distinct=True)
        ).get(pk=request.user.pk)
        
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LeaderboardView(APIView):
    permission_classes = []

    def get(self, request):
        creators = CreatorProfile.objects.select_related('user').order_by('-reputation_score')[:50]
        serializer = CreatorProfileSerializer(creators, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.user.id != user.id:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UpdateProfileSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_follow(request, username):
    target_user = get_object_or_404(User, username=username)
    
    if request.user == target_user:
        return Response({'error': 'Cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
    
    follow = Follow.objects.filter(user_from=request.user, user_to=target_user).first()
    
    if follow:
        follow.delete()
        return Response({'following': False, 'message': f'Unfollowed {username}'}, status=status.HTTP_200_OK)
    else:
        Follow.objects.create(user_from=request.user, user_to=target_user)
        return Response({'following': True, 'message': f'Now following {username}'}, status=status.HTTP_201_CREATED)


class FollowingListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        
        following_users = User.objects.filter(
            follower_set__user_from=user
        ).annotate(
            follower_count=Count('follower_set', distinct=True),
            following_count=Count('following_set', distinct=True)
        )
        
        if request.user.is_authenticated:
            following_users = following_users.annotate(
                is_following=Exists(
                    Follow.objects.filter(
                        user_from=request.user,
                        user_to=OuterRef('pk')
                    )
                )
            )
        
        serializer = UserSerializer(following_users, many=True, context={'request': request})
        return Response(serializer.data)


class FollowersListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        
        follower_users = User.objects.filter(
            following_set__user_to=user
        ).annotate(
            follower_count=Count('follower_set', distinct=True),
            following_count=Count('following_set', distinct=True)
        )
        
        if request.user.is_authenticated:
            follower_users = follower_users.annotate(
                is_following=Exists(
                    Follow.objects.filter(
                        user_from=request.user,
                        user_to=OuterRef('pk')
                    )
                )
            )
        
        serializer = UserSerializer(follower_users, many=True, context={'request': request})
        return Response(serializer.data)