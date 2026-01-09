// hooks/posts/useInfinitePosts.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { postsService } from '../../services/posts.service';
import { Post } from '@/types/index';

const POSTS_PER_PAGE = 10;
const MIN_LOAD_INTERVAL = 1500;
const MAX_RETRIES = 3;

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
  const abortControllerRef = useRef<AbortController | null>(null);
  const retriesRef = useRef(0);

  const loadMore = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    
    if (timeSinceLastLoad < MIN_LOAD_INTERVAL && lastLoadTimeRef.current !== 0) {
      return;
    }
    
    if (loadingRef.current || !hasMoreRef.current) return;
    
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    loadingRef.current = true;
    setLoading(true);
    lastLoadTimeRef.current = now;
    
    abortControllerRef.current = new AbortController();
    
    try {
      const newPosts = await postsService.getPosts(
        category === 'all' ? undefined : category,
        { page: pageRef.current, limit: POSTS_PER_PAGE }
      );
      
      retriesRef.current = 0; // Reset retries on success
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
      if (err.name === 'AbortError') return;
      
      console.error('Failed to load posts:', err);
      
      // Retry logic
      if (retriesRef.current < MAX_RETRIES) {
        retriesRef.current += 1;
        loadingRef.current = false;
        setTimeout(() => loadMore(), 1000 * retriesRef.current);
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
    // Abort pending requests on category change
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
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
  }, [category, loadMore]);

  return { posts, loading, hasMore, loadMore, initialLoad, error };
}