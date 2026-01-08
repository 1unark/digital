from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
import math
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    total_points = models.IntegerField(default=0)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    following = models.ManyToManyField(
        'self',
        through='Follow',
        through_fields=('user_from', 'user_to'),
        symmetrical=False,
        related_name='followers'
    )
    
    def __str__(self):
        return self.username
    
class CreatorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reputation_score = models.FloatField(default=0.0, db_index=True)
    rating_count = models.IntegerField(default=0)
    avg_rating = models.FloatField(default=0.0)
    work_count = models.IntegerField(default=0)

    def update_leaderboard_score(self, global_avg=4.2, min_ratings=25):
        """Bayesian rating formula with consistency boost"""
        score = (min_ratings * global_avg + self.avg_rating * self.rating_count) / (min_ratings + self.rating_count)
        score *= math.log(self.work_count + 1)
        self.reputation_score = score
        self.save(update_fields=['reputation_score'])
        
        
class Follow(models.Model):
    user_from = models.ForeignKey(User, related_name='following_set', on_delete=models.CASCADE)
    user_to = models.ForeignKey(User, related_name='follower_set', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user_from', 'user_to')
        indexes = [
            models.Index(fields=['user_from', 'user_to']),
        ]
    
    def __str__(self):
        return f"{self.user_from.username} follows {self.user_to.username}"