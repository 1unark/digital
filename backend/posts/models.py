# posts/models.py
import uuid
from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.core.files.base import ContentFile
import subprocess
import tempfile
import os

class MainCategory(models.Model):
    """WIP/Feedback or Finished Work"""
    label = models.CharField(max_length=100, help_text="e.g., 'WIP/Feedback' or 'Finished Work'")
    slug = models.SlugField(unique=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "Main Categories"
        ordering = ['order', 'label']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.label)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.label


class Category(models.Model):
    label = models.CharField(max_length=100, help_text="The display name (e.g., 'Anime (AMV)')")
    slug = models.SlugField(unique=True, blank=True, help_text="The URL-friendly name (e.g., 'amv')")
    order = models.PositiveIntegerField(default=0, help_text="Lower numbers appear first in the sidebar")

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['order', 'label']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.label)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.label


class Post(models.Model):
    STATUS_CHOICES = [
        ('processing', 'Processing'),
        ('ready', 'Ready'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    video = models.FileField(upload_to='videos/', max_length=500)
    thumbnail = models.ImageField(upload_to='thumbnails/', null=True, blank=True, max_length=500)
    og_image = models.ImageField(upload_to='og_images/', null=True, blank=True, max_length=500)  # NEW
    caption = models.TextField(blank=True)
    editing_software = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    main_category = models.ForeignKey(
        'MainCategory',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posts'
    )
    category = models.ForeignKey(
        'Category', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='posts'
    ) 
    feedback_wanted = models.BooleanField(default=False)   
    plus_one_count = models.IntegerField(default=0)
    plus_two_count = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0, db_index=True)
    view_count = models.PositiveIntegerField(default=0, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-total_score', '-created_at']),
        ]
    
    def save(self, *args, **kwargs):
        if self.video and not self.thumbnail:
            is_new = self.pk is None
            if is_new:
                super().save(*args, **kwargs)
            
            try:
                # Generate regular thumbnail (square)
                with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_thumb:
                    tmp_path = tmp_thumb.name
                
                subprocess.run([
                    'ffmpeg',
                    '-i', self.video.path,
                    '-ss', '00:00:03',
                    '-vframes', '1',
                    '-q:v', '2',
                    '-y',
                    tmp_path
                ], check=True, capture_output=True, stderr=subprocess.PIPE)
                
                # Save square thumbnail
                with open(tmp_path, 'rb') as f:
                    thumbnail_name = f'thumb_{os.path.basename(self.video.name)}.jpg'
                    self.thumbnail.save(thumbnail_name, ContentFile(f.read()), save=False)
                
                # Generate OG image (1200x630 from video frame, preserving aspect ratio)
                try:
                    from PIL import Image
                    import io
                    
                    # Open the ORIGINAL video frame (before squaring)
                    img = Image.open(tmp_path)
                    
                    og_width, og_height = 1200, 630
                    og_img = Image.new('RGB', (og_width, og_height), (0, 0, 0))
                    
                    img_ratio = img.width / img.height
                    target_ratio = og_width / og_height
                    
                    if img_ratio > target_ratio:
                        new_width = og_width
                        new_height = int(og_width / img_ratio)
                    else:
                        new_height = og_height
                        new_width = int(og_height * img_ratio)
                    
                    img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    
                    x = (og_width - new_width) // 2
                    y = (og_height - new_height) // 2
                    og_img.paste(img_resized, (x, y))
                    
                    output = io.BytesIO()
                    og_img.save(output, format='JPEG', quality=85)
                    og_name = f'og_{os.path.basename(self.video.name)}.jpg'
                    self.og_image.save(og_name, ContentFile(output.getvalue()), save=False)
                    
                except Exception as e:
                    print(f"OG image generation failed: {str(e)}")
                
                os.unlink(tmp_path)
                
            except Exception as e:
                print(f"Error: {str(e)}")
                self.status = 'failed'
        
        super().save(*args, **kwargs)

    
    def calculate_score(self):
        from votes.models import Vote
        votes = Vote.objects.filter(post=self)
        self.plus_one_count = votes.filter(value=1).count()
        self.plus_two_count = votes.filter(value=2).count()
        self.total_score = self.plus_one_count + (2 * self.plus_two_count)
        self.save(update_fields=['plus_one_count', 'plus_two_count', 'total_score'])
    
    def __str__(self):
        return f"Post by {self.user.username} at {self.created_at}"