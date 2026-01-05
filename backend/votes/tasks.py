from celery import shared_task
from django.db.models import Sum, Max
from django.utils import timezone
import math
from posts.models import Post
from users.models import CreatorProfile

@shared_task
def recalculate_creator_reputation(creator_id, global_avg, min_ratings):
    try:
        creator = CreatorProfile.objects.get(id=creator_id)
        now = timezone.now()
        
        # 1. Get stats and the date of the newest post
        stats = Post.objects.filter(user=creator.user).aggregate(
            total_v=Sum('total_score'),
            total_c=Sum('rating_count'),
            last_post_date=Max('created_at') # When was their last work?
        )

        total_votes = stats['total_v'] or 0
        total_count = stats['total_c'] or 0
        work_count = Post.objects.filter(user=creator.user).count()
        last_active = stats['last_post_date'] or creator.user.date_joined

        # 2. Bayesian Average
        raw_avg = total_votes / max(total_count, 1)
        v, m, R, C = total_count, min_ratings, raw_avg, global_avg
        bayesian_avg = (m * C + v * R) / (m + v)
        
        # 3. Time Decay (The "Anti-Stagnation" Logic)
        # Calculate days since last post
        days_since_active = (now - last_active).days
        # We use a base of 2 so the divisor is never < 1 (prevents score inflation)
        # Gravity of 1.2 is a good starting point
        gravity = 1.1
        time_decay = 1 / math.pow((days_since_active + 2), gravity)

        # 4. Final Reputation Score
        # (Bayesian Quality) * (Quantity Bonus) * (Freshness)
        reputation_score = (bayesian_avg * math.log(work_count + 1)) * time_decay

        # 5. Save
        creator.avg_rating = raw_avg
        creator.reputation_score = reputation_score
        creator.save(update_fields=['avg_rating', 'reputation_score'])
        
    except CreatorProfile.DoesNotExist:
        pass