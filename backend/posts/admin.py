# posts/admin.py
from django.contrib import admin
from .models import Post, Category

admin.site.register(Category)
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'status',
        'total_score',
        'plus_one_count',
        'plus_two_count',
        'created_at',
    )

    list_filter = (
        'status',
        'created_at',
    )

    search_fields = (
        'user__username',
        'caption',
    )

    ordering = ('-created_at',)

    list_per_page = 25

    readonly_fields = (
        'total_score',
        'created_at',
        'updated_at',
    )

    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'caption', 'status'),
        }),
        ('Media', {
            'fields': ('video', 'thumbnail', 'category'),
        }),
        ('Votes', {
            'fields': ('plus_one_count', 'plus_two_count', 'total_score'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )

    actions = ['recalculate_scores', 'mark_ready', 'mark_failed']