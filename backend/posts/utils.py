# posts/utils.py
from typing import Optional

def get_user_identifier(request) -> str:
    """
    Get a unique identifier for the user.
    Priority: authenticated user ID > session key > IP address
    """
    # If user is authenticated, use their user ID
    if request.user.is_authenticated:
        return f"user_{request.user.id}"
    
    # Try to use session key
    if hasattr(request, 'session') and request.session.session_key:
        return f"session_{request.session.session_key}"
    
    # Fallback to IP address (least reliable due to NAT, proxies, etc.)
    ip = get_client_ip(request)
    return f"ip_{ip}"


def get_client_ip(request) -> str:
    """Get the client's IP address from the request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', 'unknown')
    return ip


import os
from uuid import uuid4


def user_avatar_path(instance, filename):
    """
    Upload avatars to: avatars/{user_id}.{ext}
    This ensures one avatar per user and prevents filename collisions
    """
    ext = filename.split('.')[-1].lower()
    return f'avatars/{instance.id}.{ext}'


def post_video_path(instance, filename):
    """
    Upload videos to: videos/{post_id}.{ext}
    This ensures one video per post and prevents filename collisions
    """
    ext = filename.split('.')[-1].lower()
    return f'videos/{instance.id}.{ext}'


def post_thumbnail_path(instance, filename):
    """
    Upload thumbnails to: thumbnails/{post_id}.{ext}
    This ensures one thumbnail per post and prevents filename collisions
    """
    ext = filename.split('.')[-1].lower()
    return f'thumbnails/{instance.id}.{ext}'
