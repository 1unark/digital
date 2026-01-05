# users/views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer,  CreatorProfileSerializer
from rest_framework import status

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
    
    
    
from django.shortcuts import render
from users.models import CreatorProfile

class LeaderboardView(APIView):
    permission_classes = [] # Make it public so anyone can see the rankings

    def get(self, request):
        # Fetch top 20 creators based on the reputation score we calculated
        creators = CreatorProfile.objects.select_related('user').order_by('-reputation_score')[:20]
        
        # If you have a serializer, use it here
        serializer = CreatorProfileSerializer(creators, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)