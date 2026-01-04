# votes/admin.py
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
    )

    readonly_fields = ('created_at',)

    list_per_page = 50