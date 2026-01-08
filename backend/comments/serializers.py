from rest_framework import serializers
from .models import Comment
from users.models import Follow
from django.db.models import Exists, OuterRef


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    reply_count = serializers.IntegerField(read_only=True)
    is_author = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'parent', 'content', 'author', 'created_at', 
                  'updated_at', 'is_edited', 'reply_count', 'is_author']
        read_only_fields = ['created_at', 'updated_at', 'is_edited']
    
    def get_author(self, obj):
        avatar = None
        if hasattr(obj.user, 'avatar') and obj.user.avatar:
            try:
                request = self.context.get('request')
                avatar = request.build_absolute_uri(obj.user.avatar.url) if request else obj.user.avatar.url
            except ValueError:
                avatar = None
        
        # Use annotated value from queryset
        is_following = getattr(obj, 'is_following_author', False)
        
        return {
            'name': obj.user.username,
            'avatar': avatar,
            'is_following': is_following
        }
    
    def get_is_author(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user.id == request.user.id
        return False


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['post', 'parent', 'content']
    
    def validate_content(self, value):
        if len(value.strip()) == 0:
            raise serializers.ValidationError("Content cannot be empty")
        if len(value) > 1000:
            raise serializers.ValidationError("Content cannot exceed 1000 characters")
        return value
    
    def validate_parent(self, value):
        if value and value.parent is not None:
            raise serializers.ValidationError("Cannot reply to a reply (max 2 levels)")
        return value
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class CommentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['content']
    
    def validate_content(self, value):
        if len(value.strip()) == 0:
            raise serializers.ValidationError("Content cannot be empty")
        if len(value) > 1000:
            raise serializers.ValidationError("Content cannot exceed 1000 characters")
        return value