// components/profile/UserVideos.tsx
'use client';

import { useUserVideos } from '@/hooks/profile/useUserVideos';
import { VideoCard } from '@/components/feed/VideoCard';

interface UserVideosProps {
  username: string;
}

export function UserVideos({ username }: UserVideosProps) {
  const { videos, loading, error } = useUserVideos(username);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No videos uploaded yet</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} post={video} />
        ))}
      </div>
    </div>
  );
}