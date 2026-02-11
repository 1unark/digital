
def user_avatar_path(instance, filename):
    """
    Upload avatars to: avatars/{user_id}.{ext}
    This ensures one avatar per user and prevents filename collisions
    """
    ext = filename.split('.')[-1].lower()
    return f'avatars/{instance.id}.{ext}'

