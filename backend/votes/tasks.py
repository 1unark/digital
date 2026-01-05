from celery import shared_task
from django.db.models import Sum, Max
from django.utils import timezone
import math
from posts.models import Post
from users.models import CreatorProfile

# Constants for a "Legacy" style leaderboard
# Setting DECAY_RATE_PER_DAY to 0.02 means it takes 50 days of 
# total inactivity to lose just 1.0 point of reputation.
DECAY_RATE_PER_DAY = 0.02 

@shared_task
def recalculate_creator_reputation(creator_id, global_avg, min_ratings):
    """
    Recalculates a creator's reputation score using Bayesian Quality,
    Work Volume, and Linear Time Decay.
    """
    try:
        creator = CreatorProfile.objects.get(id=creator_id)
        now = timezone.now()
        
        # 1. Aggregate stats from all posts by this creator
        stats = Post.objects.filter(user=creator.user).aggregate(
            total_v=Sum('total_score'),     # Sum of all vote values
            total_c=Sum('rating_count'),    # Total number of votes received
            last_post_date=Max('created_at'), # Date of most recent contribution
            work_c=Sum(1)                   # Row count (efficient)
        )

        total_votes = stats['total_v'] or 0
        total_count = stats['total_c'] or 0
        work_count = stats['work_c'] or 0
        last_active = stats['last_post_date'] or creator.user.date_joined

        # 2. Bayesian Average (Confidence-weighted Quality)
        # This prevents low-vote accounts from reaching the top.
        raw_avg = total_votes / max(total_count, 1)
        v = total_count
        m = min_ratings # The 'Skepticism' threshold (e.g., 100)
        R = raw_avg
        C = global_avg
        
        bayesian_avg = (m * C + v * R) / (m + v)
        
        # 3. Work Multiplier (The "Grind" Bonus)
        # log(work_count + 1) ensures 50 posts rank higher than 5.
        quantity_bonus = math.log(work_count + 1)

        # 4. Linear Time Decay (The "Slow Leak")
        # Subtracts points based on days of inactivity instead of dividing.
        days_since_active = (now - last_active).days
        total_decay = days_since_active * DECAY_RATE_PER_DAY

        # 5. Calculate Final Score
        # Result = (Quality * Quantity) - Inactivity Leak
        base_score = bayesian_avg * quantity_bonus
        reputation_score = max(0, base_score - total_decay)

        # 6. Save to Database
        creator.avg_rating = raw_avg
        creator.rating_count = total_count
        creator.work_count = work_count
        creator.reputation_score = reputation_score
        
        creator.save(update_fields=[
            'avg_rating', 
            'rating_count', 
            'work_count', 
            'reputation_score'
        ])
        
    except CreatorProfile.DoesNotExist:
        pass

@shared_task
def decay_all_creators():
    """
    Scheduled task (Celery Beat) to run daily. 
    Applies the linear 'leak' even to creators who haven't received new votes.
    """
    # Use constants consistent with your signals
    GLOBAL_AVG = 4.2
    MIN_RATINGS = 100 
    
    creator_ids = CreatorProfile.objects.values_list('id', flat=True)
    for cid in creator_ids:
        recalculate_creator_reputation.delay(cid, GLOBAL_AVG, MIN_RATINGS)