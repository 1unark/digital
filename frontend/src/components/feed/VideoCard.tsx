'use client';

import { Post } from '@/types/index';
import { VoteButtons } from './VoteButtons';

interface VideoCardProps {
  post: Post;
}

export function VideoCard({ post }: VideoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div>
          <p className="font-semibold">{post.user.username}</p>
          <p className="text-sm text-gray-500">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <video src={post.video} controls className="w-full rounded-lg" />
      <p className="mt-3">{post.caption}</p>
      <VoteButtons post={post} />
    </div>
  );
}