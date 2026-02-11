# notifications/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from comments.models import Comment
from users.models import Follow
from .models import Notification
from .tasks import create_notification_async


@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    """Notify post author when someone comments"""
    if not created:
        return
    
    comment = instance
    
    # If it's a reply, notify the parent comment author
    if comment.parent:
        create_notification_async.delay(
            recipient_id=str(comment.parent.user.id),
            actor_id=str(comment.user.id),
            notification_type=Notification.REPLY,
            model_name='comment',
            app_label='comments',
            object_id=str(comment.id),
            extra_data={'post_id': str(comment.post.id)}
        )
    else:
        # Notify post author
        create_notification_async.delay(
            recipient_id=str(comment.post.user.id),
            actor_id=str(comment.user.id),
            notification_type=Notification.COMMENT,
            model_name='comment',
            app_label='comments',
            object_id=str(comment.id),
            extra_data={'post_id': str(comment.post.id)}
        )


@receiver(post_save, sender=Follow)
def create_follow_notification(sender, instance, created, **kwargs):
    """Notify user when someone follows them"""
    if not created:
        return
    
    create_notification_async.delay(
        recipient_id=str(instance.user_to.id),
        actor_id=str(instance.user_from.id),
        notification_type=Notification.FOLLOW,
        model_name='follow',
        app_label='users',
        object_id=str(instance.id),
        extra_data={}
    )