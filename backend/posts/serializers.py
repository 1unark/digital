# serializers.py
from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    videoUrl = serializers.SerializerMethodField()
    thumbnailUrl = serializers.SerializerMethodField()
    title = serializers.CharField(source='caption')
    likes = serializers.IntegerField(source='plus_one_count')
    views = serializers.IntegerField(default=0)
    createdAt = serializers.DateTimeField(source='created_at')
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'videoUrl', 'thumbnailUrl', 'author', 
                  'createdAt', 'likes', 'views']
        
    def get_author(self, obj):
        avatar = None
        if hasattr(obj.user, 'avatar') and obj.user.avatar:
            try:
                avatar = obj.user.avatar.url
            except ValueError:
                avatar = None
        
        return {
            'name': obj.user.username,
            'avatar': avatar
        }
    
    def get_videoUrl(self, obj):
        if obj.video:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.video.url) if request else obj.video.url
        return None
    
    def get_thumbnailUrl(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url
        return None