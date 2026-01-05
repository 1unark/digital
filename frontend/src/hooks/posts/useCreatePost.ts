// hooks/posts/useCreatePost.ts
import { useState } from 'react';
import { postsService } from '../../services/posts.service';
import { Post } from '@/types/index';

export function useCreatePost() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const createPost = async (formData: FormData): Promise<Post> => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const post = await postsService.createPost(formData, setProgress);
      return post;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setProgress(0);
    setError(null);
    setIsUploading(false);
  };

  return { createPost, isUploading, progress, error, reset };
}