# posts/models.py
import uuid
from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Category(models.Model):
    label = models.CharField(max_length=100, help_text="The display name (e.g., 'Anime (AMV)')")
    slug = models.SlugField(unique=True, blank=True, help_text="The URL-friendly name (e.g., 'amv')")
    order = models.PositiveIntegerField(default=0, help_text="Lower numbers appear first in the sidebar")

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['order', 'label']

    def save(self, *args, **kwargs):
        # Automatically creates a slug from the label if you don't provide one
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
    caption = models.TextField(blank=True)
    editing_software = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    category = models.ForeignKey(
            Category, 
            on_delete=models.SET_NULL, 
            null=True, 
            blank=True,
            related_name='posts'
        )    
    plus_one_count = models.IntegerField(default=0)
    plus_two_count = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-total_score', '-created_at']),
        ]
    
    def calculate_score(self):
        from votes.models import Vote
        votes = Vote.objects.filter(post=self)
        self.plus_one_count = votes.filter(value=1).count()
        self.plus_two_count = votes.filter(value=2).count()
        self.total_score = self.plus_one_count + (2 * self.plus_two_count)
        self.save(update_fields=['plus_one_count', 'plus_two_count', 'total_score'])
    
    def __str__(self):
        return f"Post by {self.user.username} at {self.created_at}"
    
    
    
