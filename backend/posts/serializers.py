from rest_framework import serializers
from .models import Post
from users.serializers import UserSerializer

class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'user', 'video', 'thumbnail', 'caption', 'status',
                  'plus_one_count', 'plus_two_count', 'total_score', 'created_at']
        read_only_fields = ['plus_one_count', 'plus_two_count', 'total_score', 'status']