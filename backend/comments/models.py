import uuid
from django.db import models
from django.conf import settings
from posts.models import Post


class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_edited = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['post', '-created_at']),
            models.Index(fields=['parent', '-created_at']),
        ]
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.post.id}"
    
    def save(self, *args, **kwargs):
        # Mark as edited if content changes (exclude initial creation)
        if self.pk:
            try:
                old = Comment.objects.get(pk=self.pk)
                if old.content != self.content:
                    self.is_edited = True
            except Comment.DoesNotExist:
                pass
        super().save(*args, **kwargs)