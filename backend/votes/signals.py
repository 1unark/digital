import math
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import F

from .models import Vote
from .tasks import recalculate_creator_reputation

# Constants (Could also be moved to settings.py)
GLOBAL_AVG_RATING = 4.2
MIN_RATINGS = 25

@receiver(post_save, sender=Vote)
def update_post_and_creator(sender, instance, created, **kwargs):
    """
    Handles immediate post updates and triggers background 
    recalculation for the creator's reputation.
    """
    if not created:
        return

    post = instance.post

    # 1. Update Post counts atomically in the DB
    update_fields = {
        'total_score': F('total_score') + instance.value,
        'rating_count': F('rating_count') + 1,
    }

    if instance.value == 1:
        update_fields['plus_one_count'] = F('plus_one_count') + 1
    elif instance.value == 2:
        update_fields['plus_two_count'] = F('plus_two_count') + 1

    # Apply updates directly to the DB to avoid race conditions
    # We use .filter().update() because it returns the number of rows updated
    # and executes a single SQL UPDATE statement.
    sender.objects.filter(post=post).update() # Note: This is a placeholder for logic
    
    # Correct way to update the specific post instance's related post object
    post.__class__.objects.filter(pk=post.pk).update(**update_fields)

    # 2. Refresh post to calculate the new average rating for that specific post
    post.refresh_from_db()
    if post.rating_count > 0:
        post.avg_rating = post.total_score / post.rating_count
        post.save(update_fields=['avg_rating'])

    # 3. Offload the heavy CreatorProfile math to Celery
    # We pass IDs only (best practice for Celery)
    creator = post.user.creatorprofile
    recalculate_creator_reputation.delay(
        creator.id, 
        GLOBAL_AVG_RATING, 
        MIN_RATINGS
    )