// hooks/profile/useUserVideos.ts
import { useState, useEffect } from 'react';
import { userService } from '../../services/user.service';
import { Post } from '@/types/index';

export function useUserVideos(userId: string) {
  const [videos, setVideos] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const videoData = await userService.getUserVideos(userId);
        setVideos(videoData);
        setError(null);
      } catch (err) {
        setError('Failed to load videos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [userId]);

  return { videos, loading, error };
}