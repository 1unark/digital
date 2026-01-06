from rest_framework import serializers
from .models import Post, Category
from django.conf import settings

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'label', 'slug']

class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    videoUrl = serializers.SerializerMethodField()
    thumbnailUrl = serializers.SerializerMethodField()
    
    # Mapping frontend camelCase names to backend snake_case database fields
    title = serializers.CharField(source='caption')
    editingSoftware = serializers.CharField(source='editing_software', required=False, allow_blank=True)
    likes = serializers.IntegerField(source='plus_one_count', read_only=True)
    plusTwoCount = serializers.IntegerField(source='plus_two_count', read_only=True)
    totalScore = serializers.IntegerField(source='total_score', read_only=True)
    views = serializers.IntegerField(default=0, read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    userVote = serializers.SerializerMethodField()

    # READ: Returns the full category object (label, slug, etc.) to the frontend
    category = CategorySerializer(read_only=True)
    
    # WRITE: Accepts just the ID from Next.js and saves it to the 'category' foreign key
    # This matches your Next.js: formData.append('categoryId', category.id)
    categoryId = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'videoUrl', 'thumbnailUrl', 'author', 
            'createdAt', 'likes', 'plusTwoCount', 'totalScore', 'views', 
            'userVote', 'editingSoftware', 'category', 'categoryId'
        ]

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

    def get_userVote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Import here to avoid circular imports
            from votes.models import Vote
            try:
                vote = Vote.objects.get(user=request.user, post=obj)
                return vote.value
            except Vote.DoesNotExist:
                return None
        return None

# Use this specifically for the Create view if you want a stripped-down version

from PIL import Image
import io
from django.core.files.base import ContentFile

class PostCreateSerializer(serializers.ModelSerializer):
    thumbnail = serializers.ImageField(required=True)
    
    # Handling the Category ID from the frontend
    categoryId = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Post
        # These must match the field names in your models.py
        fields = ['video', 'thumbnail', 'caption', 'editing_software', 'categoryId']

    def create(self, validated_data):
        thumb = validated_data.get('thumbnail')
        if thumb:
            # 1. Open the image
            img = Image.open(thumb)
            img = img.convert('RGB')
            
            # 2. Resize to 720x720 (Square)
            img.thumbnail((720, 720)) 
            
            # 3. Compress to JPEG
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=60) 
            
            # 4. Replace the original file with the compressed one
            validated_data['thumbnail'] = ContentFile(output.getvalue(), name=thumb.name)

        return super().create(validated_data)