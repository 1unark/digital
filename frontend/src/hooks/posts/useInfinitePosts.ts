// hooks/posts/useInfinitePosts.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { postsService } from '../../services/posts.service';
import { Post } from '@/types/index';

const POSTS_PER_PAGE = 10;
const MIN_LOAD_INTERVAL = 1000;
const MAX_RETRIES = 2;
const RETRY_DELAY_BASE = 1000;

export function useInfinitePosts(category?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const lastLoadTimeRef = useRef(0);
  const retriesRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadMore = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    
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
      
      retriesRef.current = 0;
      setError(null);
      
      if (!newPosts || newPosts.length === 0) {
        setHasMore(false);
        hasMoreRef.current = false;
        return;
      }
      
      if (newPosts.length < POSTS_PER_PAGE) {
        setHasMore(false);
        hasMoreRef.current = false;
      }
      
      setPosts(prev => [...prev, ...newPosts]);
      pageRef.current += 1;
      
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      
      // Only retry on network errors, not 404s
      const shouldRetry = 
        retriesRef.current < MAX_RETRIES && 
        (!err.response || err.response.status >= 500);
      
      if (shouldRetry) {
        retriesRef.current += 1;
        loadingRef.current = false;
        setLoading(false);
        
        retryTimeoutRef.current = setTimeout(() => {
          loadMore();
        }, RETRY_DELAY_BASE * retriesRef.current);
        return;
      }
      
      setError('Failed to load posts');
      setHasMore(false);
      hasMoreRef.current = false;
      
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setInitialLoad(false);
    }
  }, [category]);

  useEffect(() => {
    // Clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    setPosts([]);
    pageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    setInitialLoad(true);
    setError(null);
    loadingRef.current = false;
    lastLoadTimeRef.current = 0;
    retriesRef.current = 0;
    
    loadMore();
    
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [category, loadMore]);

  return { posts, loading, hasMore, loadMore, initialLoad, error };
}