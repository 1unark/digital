// components/feed/VideoCard.tsx
'use client';

import { Post } from '@/types/index';
import { VoteButtons } from './VoteButtons';

interface VideoCardProps {
  post: Post;
}

export function VideoCard({ post }: VideoCardProps) {
  console.log('VideoCard post:', post);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          {post.author?.avatar ? (
            <img src={post.author.avatar} alt={post.author.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-gray-600 font-semibold">
              {post.author?.name ? post.author.name[0].toUpperCase() : '?'}
            </span>
          )}
        </div>
        <div>
          <p className="font-semibold">{post.author?.name || 'Unknown'}</p>
          <p className="text-sm text-gray-500">
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date'}
          </p>
        </div>
      </div>

      {post.videoUrl && (
        <video src={post.videoUrl} controls className="w-full rounded-lg" />
      )}
      <p className="mt-3">{post.title || 'No title'}</p>
      <VoteButtons post={post} />
    </div>
  );
}