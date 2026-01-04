from django.contrib import admin
from .models import Vote 

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'post',
        'value',
        'vote_context',
        'created_at',
    )

    list_filter = (
        'value',
        'vote_context',
        'created_at',
    )

    search_fields = (
        'user__username',
        'post__id',
    )

    readonly_fields = ('created_at',)

    autocomplete_fields = ('user', 'post')

    list_per_page = 50
