# notifications/services.py
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from ..models import Notification, NotificationPreference


class NotificationService:
    @staticmethod
    def create_notification(recipient, actor, notification_type, content_object, extra_data=None):
        """
        Create a notification if user preferences allow it.
        Called from Celery tasks.
        """
        # Check preferences
        prefs, _ = NotificationPreference.objects.get_or_create(user=recipient)
        pref_field = f"{notification_type}_enabled"
        if not getattr(prefs, pref_field, True):
            return None
        
        # Don't notify self
        if recipient == actor:
            return None
        
        content_type = ContentType.objects.get_for_model(content_object)
        
        # Check for duplicate recent notifications (5 min debounce)
        existing = Notification.objects.filter(
            recipient=recipient,
            actor=actor,
            notification_type=notification_type,
            content_type=content_type,
            object_id=content_object.id
        ).order_by('-created_at').first()
        
        if existing and (timezone.now() - existing.created_at).seconds < 300:
            return existing
        
        return Notification.objects.create(
            recipient=recipient,
            actor=actor,
            notification_type=notification_type,
            content_type=content_type,
            object_id=content_object.id,
            extra_data=extra_data or {}
        )
    
    @staticmethod
    def mark_as_read(notification_ids, user):
        """Bulk mark as read with permission check"""
        return Notification.objects.filter(
            id__in=notification_ids,
            recipient=user
        ).update(is_read=True)
    
    @staticmethod
    def mark_all_as_read(user):
        """Mark all notifications as read for a user"""
        return Notification.objects.filter(
            recipient=user,
            is_read=False
        ).update(is_read=True)