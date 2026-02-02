// hooks/useNotificationPolling.ts
import { useEffect, useRef, useCallback } from 'react';
import { notificationsService } from '../../services/notifications.service';

export function useNotificationPolling(
  user: any,
  setUnreadCount: (count: number) => void,
  interval = 60000 // Increased to 60s for better scalability
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);

  const fetchUnreadCount = useCallback(async () => {
    // Skip if tab is hidden or already fetching
    if (document.hidden || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [setUnreadCount]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return; // Already polling
    
    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, interval);
  }, [fetchUnreadCount, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!user) {
      stopPolling();
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    // Start polling if tab is visible
    if (!document.hidden) {
      startPolling();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, startPolling, stopPolling]);
}