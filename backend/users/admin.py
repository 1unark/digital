from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User 

# Register your models here.
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    list_display = (
        'username',
        'email',
        'total_points',
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

    readonly_fields = ('total_points',)

    fieldsets = UserAdmin.fieldsets + (
        ('Profile', {
            'fields': ('bio', 'avatar', 'total_points'),
        }),
    )
