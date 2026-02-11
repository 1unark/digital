# notifications/serializers.py
from rest_framework import serializers
from .models import Notification, NotificationPreference
from users.serializers import UserSerializer
from comments.models import Comment


class NotificationSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)
    message = serializers.SerializerMethodField()
    action_url = serializers.SerializerMethodField()
    preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'actor', 'notification_type', 'message', 'action_url',
            'preview', 'is_read', 'created_at'
        ]
    
    def get_message(self, obj):
        messages = {
            'comment': f"{obj.actor.username} commented on your post",
            'reply': f"{obj.actor.username} replied to your comment",
            'follow': f"{obj.actor.username} followed you",
            'rating': f"{obj.actor.username} rated your work",
        }
        return messages.get(obj.notification_type, "New notification")
    
    def get_action_url(self, obj):
        if obj.notification_type in ['comment', 'reply']:
            post_id = obj.extra_data.get('post_id')
            if post_id:
                return f"/post/{post_id}"
        elif obj.notification_type == 'follow':
            return f"/profile/{obj.actor.username}"
        return None
    
    def get_preview(self, obj):
        """Get preview text for comment/reply notifications"""
        if obj.notification_type in ['comment', 'reply']:
            try:
                comment = obj.content_object
                if isinstance(comment, Comment):
                    return comment.content[:100] + ('...' if len(comment.content) > 100 else '')
            except:
                pass
        return None


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'user', 'follow_enabled', 'comment_enabled', 'reply_enabled',
            'rating_enabled', 'work_published_enabled', 'milestone_enabled',
            'email_notifications'
        ]
        read_only_fields = ['user']