# posts/services/redis_service.py
from django.core.cache import cache
from django.conf import settings

from typing import Optional
import logging

logger = logging.getLogger(__name__)

class RedisViewTracker:
    """
    Service class for tracking post views using Redis.
    Uses Redis TTL for automatic cleanup of old view records.
    """
    
    def __init__(self):
        self.cooldown = getattr(settings, 'VIEW_TRACKING_COOLDOWN', 60 * 60 * 3)  # 3 hours
        self.key_prefix = getattr(settings, 'VIEW_REDIS_KEY_PREFIX', 'post_view')
    
    def _get_key(self, post_id: str, user_identifier: str) -> str:
        """Generate Redis key for a post view."""
        return f"{self.key_prefix}:{post_id}:{user_identifier}"
    
    def can_track_view(self, post_id: str, user_identifier: str) -> bool:
        """
        Check if a view should be tracked.
        Returns True if the cooldown period has passed or no record exists.
        """
        key = self._get_key(post_id, user_identifier)
        exists = cache.get(key)
        
        if exists:
            logger.info(f"View cooldown active for post {post_id}, user {user_identifier}")
            return False
        
        return True
    
    def track_view(self, post_id: str, user_identifier: str) -> bool:
        """
        Track a view by setting a Redis key with TTL.
        Returns True if tracked, False if cooldown is active.
        """
        if not self.can_track_view(post_id, user_identifier):
            return False
        
        key = self._get_key(post_id, user_identifier)
        cache.set(key, 1, timeout=self.cooldown)
        logger.info(f"Tracked view for post {post_id}, user {user_identifier}")
        return True
    
    def get_remaining_cooldown(self, post_id: str, user_identifier: str) -> Optional[int]:
        """
        Get remaining cooldown time in seconds.
        Returns None if no cooldown is active.
        """
        key = self._get_key(post_id, user_identifier)
        
        # Get TTL from Redis directly
        try:
            from django_redis import get_redis_connection
            redis_conn = get_redis_connection("default")
            ttl = redis_conn.ttl(key)
            
            if ttl > 0:
                return ttl
        except Exception as e:
            logger.error(f"Error getting TTL: {e}")
        
        return None
    
    def clear_view(self, post_id: str, user_identifier: str) -> bool:
        """Clear a view record (useful for testing or admin purposes)."""
        key = self._get_key(post_id, user_identifier)
        cache.delete(key)
        logger.info(f"Cleared view record for post {post_id}, user {user_identifier}")
        return True


# Singleton instance
redis_view_tracker = RedisViewTracker()