import os
from celery import Celery
import multiprocessing
from celery.schedules import crontab

# --- Windows fix for spawn method ---
if __name__ == "__main__":
    multiprocessing.set_start_method('spawn', force=True)

# --- Django settings ---
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# --- Create Celery app ---
app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'daily-reputation-decay': {
        'task': 'users.tasks.decay_all_creators',
        'schedule': crontab(hour=0, minute=0), # Run at midnight
    },
}