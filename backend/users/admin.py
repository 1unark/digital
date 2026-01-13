from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, CreatorProfile

class CreatorProfileInline(admin.StackedInline):
    model = CreatorProfile
    can_delete = False
    fields = ('work_count', 'reputation_score', 'rating_count', 'avg_rating')
    readonly_fields = ('reputation_score',)  # Keep calculated fields readonly
    extra = 0

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    inlines = [CreatorProfileInline]
    
    def follower_count_display(self, obj):
        return obj.followers.count()
    follower_count_display.short_description = 'Followers'
    
    def following_count_display(self, obj):
        return obj.following.count()
    following_count_display.short_description = 'Following'
    
    list_display = (
        'username',
        'email',
        'total_points',
        'follower_count_display',
        'following_count_display',
        'is_staff',
        'is_superuser',
        'is_active',
    )

    list_filter = (
        'is_staff',
        'is_superuser',
        'is_active',
    )

    search_fields = (
        'username',
        'email',
    )

    readonly_fields = ('total_points', 'follower_count_display', 'following_count_display')

    fieldsets = UserAdmin.fieldsets + (
        ('Profile', {
            'fields': ('bio', 'avatar', 'total_points', 'follower_count_display', 'following_count_display'),
        }),
    )