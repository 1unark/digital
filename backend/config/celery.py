import os
from celery import Celery
import multiprocessing

# --- Windows fix for spawn method ---
if __name__ == "__main__":
    multiprocessing.set_start_method('spawn', force=True)

# --- Django settings ---
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# --- Create Celery app ---
app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
