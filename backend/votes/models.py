# votes/models.py
from django.db import models
from django.conf import settings
from posts.models import Post

class Vote(models.Model):
    VOTE_CHOICES = [
        (1, 'Plus One'),
        (2, 'Plus Two'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='votes')
    value = models.IntegerField(choices=VOTE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    weight = models.FloatField(default=1.0)
    
    vote_context = models.CharField(
        max_length=20,
        choices=[
            ('feed', 'Feed'),
            ('profile', 'Profile'),
            ('leaderboard', 'Leaderboard'),
        ],
        default='feed'
    )
    
    class Meta:
        unique_together = ['user', 'post']
        indexes = [
            models.Index(fields=['user', 'post']),
        ]
    
    def __str__(self):
        return f"{self.user.username} +{self.value} on {self.post.id}"