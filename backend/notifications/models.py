# notifications/models.py
import uuid
from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey


class Notification(models.Model):
    FOLLOW = 'follow'
    COMMENT = 'comment'
    REPLY = 'reply'
    RATING = 'rating'
    WORK_PUBLISHED = 'work_published'
    MILESTONE = 'milestone'
    
    TYPE_CHOICES = [
        (FOLLOW, 'Follow'),
        (COMMENT, 'Comment'),
        (REPLY, 'Reply'),
        (RATING, 'Rating'),
        (WORK_PUBLISHED, 'Work Published'),
        (MILESTONE, 'Milestone'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications',
        db_index=True
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='actions',
        null=True  # For system notifications
    )
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, db_index=True)
    
    # Generic relation to any object (Post, Comment, Follow, etc.)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Optional extra data as JSON
    extra_data = models.JSONField(default=dict, blank=True)
    
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read', '-created_at']),
            models.Index(fields=['recipient', 'notification_type', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.notification_type} for {self.recipient.username}"


class NotificationPreference(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notification_preferences'
    )
    
    # Per-type preferences
    follow_enabled = models.BooleanField(default=True)
    comment_enabled = models.BooleanField(default=True)
    reply_enabled = models.BooleanField(default=True)
    rating_enabled = models.BooleanField(default=True)
    work_published_enabled = models.BooleanField(default=True)
    milestone_enabled = models.BooleanField(default=True)
    
    # Future: email/push preferences
    email_notifications = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Preferences for {self.user.username}"