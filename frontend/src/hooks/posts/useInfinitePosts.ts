// hooks/posts/useInfinitePosts.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { postsService } from '../../services/posts.service';
import { Post } from '@/types/index';

const MAX_POSTS_IN_MEMORY = 50;
const POSTS_PER_PAGE = 10;
const REMOVE_THRESHOLD = 30;
const MIN_LOAD_INTERVAL = 2000; // Minimum 2 seconds between loads

export function useInfinitePosts(category?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const lastLoadTimeRef = useRef(0);

  const loadMore = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    
    // Throttle: prevent loading if less than MIN_LOAD_INTERVAL has passed
    if (timeSinceLastLoad < MIN_LOAD_INTERVAL && lastLoadTimeRef.current !== 0) {
      return;
    }
    
    if (loadingRef.current || !hasMoreRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    lastLoadTimeRef.current = now;
    
    try {
      const newPosts = await postsService.getPosts(
        category === 'all' ? undefined : category,
        { page: pageRef.current, limit: POSTS_PER_PAGE }
      );
      
      if (!newPosts || newPosts.length === 0) {
        setHasMore(false);
        hasMoreRef.current = false;
        loadingRef.current = false;
        setLoading(false);
        setInitialLoad(false);
        return;
      }
      
      if (newPosts.length < POSTS_PER_PAGE) {
        setHasMore(false);
        hasMoreRef.current = false;
      }
      
      setPosts(prev => {
        const updated = [...prev, ...newPosts];
        
        if (updated.length > MAX_POSTS_IN_MEMORY) {
          const removeCount = updated.length - REMOVE_THRESHOLD;
          return updated.slice(removeCount);
        }
        
        return updated;
      });
      
      pageRef.current += 1;
    } catch (error) {
      console.error('Failed to load posts:', error);
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setInitialLoad(false);
    }
  }, [category]);

  useEffect(() => {
    setPosts([]);
    pageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    setInitialLoad(true);
    loadingRef.current = false;
    lastLoadTimeRef.current = 0;
    loadMore();
  }, [category, loadMore]);

  return { posts, loading, hasMore, loadMore, initialLoad };
}