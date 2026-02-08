from rest_framework import serializers
from .models import User, CreatorProfile, Follow, SocialLink
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class SocialLinkSerializer(serializers.ModelSerializer):
    link = serializers.SerializerMethodField()
    
    class Meta:
        model = SocialLink
        fields = ['id', 'platform', 'username', 'url', 'link', 'display_order']
        read_only_fields = ['id']
    
    def get_link(self, obj):
        return obj.get_link()
    
    def validate(self, data):
        if not data.get('username') and not data.get('url'):
            raise serializers.ValidationError("Either username or URL must be provided")
        return data


class CreatorProfileSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    social_links = SocialLinkSerializer(many=True, read_only=True)
    
    class Meta:
        model = CreatorProfile
        fields = [
            'user',
            'avg_rating', 
            'rating_count', 
            'work_count', 
            'reputation_score',
            'social_links'
        ]
    
    def get_user(self, obj):
        return {
            'id': str(obj.user.id),
            'username': obj.user.username,
            'avatar': obj.user.avatar.url if obj.user.avatar else None,
        }


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    follower_count = serializers.IntegerField(read_only=True)
    following_count = serializers.IntegerField(read_only=True)
    creatorprofile = CreatorProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'total_points', 'bio', 'avatar', 'is_following', 'follower_count', 'following_count','creatorprofile']
        read_only_fields = ['total_points']
    
    def get_avatar(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if hasattr(obj, 'is_following'):
                return obj.is_following
            return Follow.objects.filter(user_from=request.user, user_to=obj).exists()
        return False


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


class CustomTokenObtainPairSerializer(serializers.Serializer):
    login = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        login = attrs.get("login")
        password = attrs.get("password")

        if not login or not password:
            raise serializers.ValidationError("Must include login and password")

        user = None

        try:
            user_obj = User.objects.get(username=login)
            if user_obj.check_password(password):
                user = user_obj
        except User.DoesNotExist:
            try:
                user_obj = User.objects.get(email__iexact=login)
                if user_obj.check_password(password):
                    user = user_obj
            except User.DoesNotExist:
                pass

        if user is None:
            raise serializers.ValidationError("Invalid login credentials")

        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user_id": user.id,
            "username": user.username,
        }


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['bio', 'avatar']
    
    def validate_bio(self, value):
        if len(value) > 150:
            raise serializers.ValidationError("Bio must be 150 characters or less")
        return value


class FollowSerializer(serializers.ModelSerializer):
    user_from = UserSerializer(read_only=True)
    user_to = UserSerializer(read_only=True)
    
    class Meta:
        model = Follow
        fields = ['id', 'user_from', 'user_to', 'created_at']