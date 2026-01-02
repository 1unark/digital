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
    vote_type = models.IntegerField(choices=VOTE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'post']
        indexes = [
            models.Index(fields=['user', 'post']),
        ]
    
    def __str__(self):
        return f"{self.user.username} +{self.vote_type} on {self.post.id}"