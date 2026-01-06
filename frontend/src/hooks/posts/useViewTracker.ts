// hooks/posts/useViewTracker.ts
import { useEffect, useRef } from 'react';
import { postsService } from '../../services/posts.service';

export const useViewTracker = (postId: string, videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !postId) return;

    const startTimer = () => {
      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(async () => {
          await postsService.trackView(postId);
          timeoutRef.current = null;
        }, 2000);
      }
    };

    const stopTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    // Listen to the actual video element state
    video.addEventListener('play', startTimer);
    video.addEventListener('pause', stopTimer);
    video.addEventListener('ended', stopTimer);

    // If the video is ALREADY playing when the hook mounts
    if (!video.paused) {
      startTimer();
    }

    return () => {
      video.removeEventListener('play', startTimer);
      video.removeEventListener('pause', stopTimer);
      video.removeEventListener('ended', stopTimer);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [postId, videoRef]);

  // We don't need to return a ref anymore because we are passing one in!
};