"""
Management command to cleanup orphaned avatar and video files from R2.
Run this AFTER deploying the new upload path functions.

Usage: python manage.py cleanup_orphaned_files --dry-run
       python manage.py cleanup_orphaned_files
"""
from django.core.management.base import BaseCommand
from django.core.files.storage import default_storage
from users.models import User
from posts.models import Post
import re


class Command(BaseCommand):
    help = 'Remove orphaned media files from R2 storage'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No files will be deleted'))
        
        self.cleanup_avatars(dry_run)
        self.cleanup_videos(dry_run)
        self.cleanup_thumbnails(dry_run)
        
        self.stdout.write(self.style.SUCCESS('Cleanup complete'))

    def cleanup_avatars(self, dry_run):
        """Remove old avatar files that don't match the new naming scheme"""
        self.stdout.write('Cleaning up avatars...')
        
        try:
            dirs, files = default_storage.listdir('avatars')
            
            # Get all valid user IDs
            valid_ids = set(str(user.id) for user in User.objects.all())
            
            for filename in files:
                # New format is {uuid}.{ext}
                # Old format has random suffixes like lyn_bIT2ua6.jpg
                match = re.match(r'^([a-f0-9-]{36})\.\w+$', filename)
                
                if not match:
                    # Old format file
                    file_path = f'avatars/{filename}'
                    if dry_run:
                        self.stdout.write(f'Would delete: {file_path}')
                    else:
                        default_storage.delete(file_path)
                        self.stdout.write(self.style.WARNING(f'Deleted: {file_path}'))
                elif match.group(1) not in valid_ids:
                    # UUID file but user doesn't exist
                    file_path = f'avatars/{filename}'
                    if dry_run:
                        self.stdout.write(f'Would delete (orphaned): {file_path}')
                    else:
                        default_storage.delete(file_path)
                        self.stdout.write(self.style.WARNING(f'Deleted (orphaned): {file_path}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error cleaning avatars: {str(e)}'))

    def cleanup_videos(self, dry_run):
        """Remove old video files that don't match the new naming scheme"""
        self.stdout.write('Cleaning up videos...')
        
        try:
            dirs, files = default_storage.listdir('videos')
            
            # Get all valid post IDs
            valid_ids = set(str(post.id) for post in Post.objects.all())
            
            for filename in files:
                # New format is {uuid}.{ext}
                match = re.match(r'^([a-f0-9-]{36})\.\w+$', filename)
                
                if not match:
                    # Old format file
                    file_path = f'videos/{filename}'
                    if dry_run:
                        self.stdout.write(f'Would delete: {file_path}')
                    else:
                        default_storage.delete(file_path)
                        self.stdout.write(self.style.WARNING(f'Deleted: {file_path}'))
                elif match.group(1) not in valid_ids:
                    # UUID file but post doesn't exist
                    file_path = f'videos/{filename}'
                    if dry_run:
                        self.stdout.write(f'Would delete (orphaned): {file_path}')
                    else:
                        default_storage.delete(file_path)
                        self.stdout.write(self.style.WARNING(f'Deleted (orphaned): {file_path}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error cleaning videos: {str(e)}'))

    def cleanup_thumbnails(self, dry_run):
        """Remove old thumbnail files that don't match the new naming scheme"""
        self.stdout.write('Cleaning up thumbnails...')
        
        try:
            dirs, files = default_storage.listdir('thumbnails')
            
            # Get all valid post IDs
            valid_ids = set(str(post.id) for post in Post.objects.all())
            
            for filename in files:
                # New format is {uuid}.{ext}
                match = re.match(r'^([a-f0-9-]{36})\.\w+$', filename)
                
                if not match:
                    # Old format file
                    file_path = f'thumbnails/{filename}'
                    if dry_run:
                        self.stdout.write(f'Would delete: {file_path}')
                    else:
                        default_storage.delete(file_path)
                        self.stdout.write(self.style.WARNING(f'Deleted: {file_path}'))
                elif match.group(1) not in valid_ids:
                    # UUID file but post doesn't exist
                    file_path = f'thumbnails/{filename}'
                    if dry_run:
                        self.stdout.write(f'Would delete (orphaned): {file_path}')
                    else:
                        default_storage.delete(file_path)
                        self.stdout.write(self.style.WARNING(f'Deleted (orphaned): {file_path}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error cleaning thumbnails: {str(e)}'))