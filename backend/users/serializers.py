from rest_framework import serializers
from .models import User, CreatorProfile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'total_points', 'bio', 'avatar']
        read_only_fields = ['total_points']
    
    def get_avatar(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already in use.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


from rest_framework_simplejwt.tokens import RefreshToken

class CustomTokenObtainPairSerializer(serializers.Serializer):
    login = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        login = attrs.get("login")
        password = attrs.get("password")

        if not login or not password:
            raise serializers.ValidationError("Must include login and password")

        user = None

        # Case-sensitive username
        try:
            user_obj = User.objects.get(username=login)
            if user_obj.check_password(password):
                user = user_obj
        except User.DoesNotExist:
            # Case-insensitive email
            try:
                user_obj = User.objects.get(email__iexact=login)
                if user_obj.check_password(password):
                    user = user_obj
            except User.DoesNotExist:
                pass

        if user is None:
            raise serializers.ValidationError("Invalid login credentials")

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user_id": user.id,
            "username": user.username,
        }


class CreatorProfileSerializer(serializers.ModelSerializer):
    # Nest the user data so you have the username for the leaderboard
    user = UserSerializer(read_only=True)
    
    # We can add a 'rank' field if you want to calculate it on the fly
    # or just let the frontend handle it based on array index.
    
    class Meta:
        model = CreatorProfile
        fields = [
            'user', 
            'avg_rating', 
            'rating_count', 
            'work_count', 
            'reputation_score'
        ]
        
        
        
        
class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['bio', 'avatar']
    
    def validate_bio(self, value):
        if len(value) > 150:
            raise serializers.ValidationError("Bio must be 150 characters or less")
        return value