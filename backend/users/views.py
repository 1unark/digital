# users/views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer,  CreatorProfileSerializer, UpdateProfileSerializer
from rest_framework import status
from django.shortcuts import render
from users.models import CreatorProfile


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer



class UserProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'username'



class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)



class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer



class LeaderboardView(APIView):
    permission_classes = [] # Make it public so anyone can see the rankings

    def get(self, request):
        # Fetch top 50 creators based on the reputation score we calculated
        creators = CreatorProfile.objects.select_related('user').order_by('-reputation_score')[:50]
        
        # If you have a serializer, use it here
        serializer = CreatorProfileSerializer(creators, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
    
    
# users/views.py

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