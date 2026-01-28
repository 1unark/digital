# notifications/tasks.py
from celery import shared_task
from django.contrib.contenttypes.models import ContentType
from django.apps import apps
from .services.services import NotificationService


@shared_task
def create_notification_async(recipient_id, actor_id, notification_type, model_name, app_label, object_id, extra_data=None):
    """
    Async notification creation to avoid blocking user actions
    """
    User = apps.get_model('users', 'User')
    
    try:
        recipient = User.objects.get(id=recipient_id)
        actor = User.objects.get(id=actor_id) if actor_id else None
        
        # Get the content type and object
        content_type = ContentType.objects.get(app_label=app_label, model=model_name)
        model_class = content_type.model_class()
        content_object = model_class.objects.get(id=object_id)
        
        NotificationService.create_notification(
            recipient=recipient,
            actor=actor,
            notification_type=notification_type,
            content_object=content_object,
            extra_data=extra_data or {}
        )
    except Exception as e:
        # Log error but don't fail - notifications aren't critical
        print(f"Failed to create notification: {e}")