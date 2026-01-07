// components/profile/UserVideos.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useUserVideos } from '@/hooks/profile/useUserVideos';

interface UserVideosProps {
  userId: string;
}

export function UserVideos({ userId }: UserVideosProps) {
  const router = useRouter();
  const { videos, loading, error } = useUserVideos(userId);

  const handleVideoClick = (videoId: string) => {
    router.push(`/post/${videoId}`);
  };

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
      
      <div className="grid grid-cols-3 gap-0">
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => handleVideoClick(video.id)}
            className="aspect-square relative overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity w-full max-w-[600px]"
          >
            <img
              src={video.thumbnailUrl || '/placeholder-thumbnail.jpg'}
              className="w-full h-full object-cover"
              alt=""
            />
            <div className="absolute bottom-0 right-0 flex items-center gap-1 bg-black/70 text-white text-sm px-2 py-1 rounded-tl-lg">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              <span>{video.viewCount || 0}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}