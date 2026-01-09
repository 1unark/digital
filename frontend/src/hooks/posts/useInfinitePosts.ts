// hooks/posts/useInfinitePosts.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { postsService } from '../../services/posts.service';
import { Post } from '@/types/index';

const POSTS_PER_PAGE = 10;
const MIN_LOAD_INTERVAL = 5000; // Minimum time between loads
const SCROLL_DEBOUNCE = 500; // Wait 500ms after last scroll before loading
const MAX_RETRIES = 2;
const RETRY_DELAY_BASE = 1000;

export function useInfinitePosts(category?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  
  const cursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const lastLoadTimeRef = useRef(0);
  const retriesRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const seenIdsRef = useRef(new Set<string>());
  const scrollDebounceRef = useRef<NodeJS.Timeout | null>(null); // NEW: Debounce timer

  const loadMore = useCallback(async (skipDebounce = false) => {
    // Clear any existing debounce timer
    if (scrollDebounceRef.current) {
      clearTimeout(scrollDebounceRef.current);
      scrollDebounceRef.current = null;
    }

    // If not skipping debounce, wait for scroll to settle
    if (!skipDebounce) {
      scrollDebounceRef.current = setTimeout(() => {
        loadMore(true); // Call again with skipDebounce after settling
      }, SCROLL_DEBOUNCE);
      return;
    }

    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    
    if (loadingRef.current || !hasMoreRef.current) {
      return;
    }
    
    // Check time interval
    if (timeSinceLastLoad < MIN_LOAD_INTERVAL && lastLoadTimeRef.current !== 0) {
      const remainingTime = MIN_LOAD_INTERVAL - timeSinceLastLoad;
      setTimeout(() => {
        if (!loadingRef.current && hasMoreRef.current) {
          loadMore(true);
        }
      }, remainingTime);
      return;
    }
    
    loadingRef.current = true;
    setLoading(true);
    lastLoadTimeRef.current = now;
    
    try {
      const response = await postsService.getPosts(
        category === 'all' ? undefined : category,
        { cursor: cursorRef.current, limit: POSTS_PER_PAGE }
      );
      
      retriesRef.current = 0;
      setError(null);
      
      const newPosts = response.results || response;
      const nextCursor = response.next ? new URL(response.next).searchParams.get('cursor') : null;
      
      if (!newPosts || newPosts.length === 0) {
        setHasMore(false);
        hasMoreRef.current = false;
        return;
      }
      
      cursorRef.current = nextCursor;
      
      if (!nextCursor) {
        setHasMore(false);
        hasMoreRef.current = false;
      }
      
      const uniqueNewPosts = newPosts.filter((post: Post) => {
        if (seenIdsRef.current.has(post.id)) {
          return false;
        }
        seenIdsRef.current.add(post.id);
        return true;
      });
      
      setPosts(prev => [...prev, ...uniqueNewPosts]);
      
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      
      const shouldRetry = 
        retriesRef.current < MAX_RETRIES && 
        (!err.response || err.response.status >= 500);
      
      if (shouldRetry) {
        retriesRef.current += 1;
        loadingRef.current = false;
        setLoading(false);
        
        retryTimeoutRef.current = setTimeout(() => {
          loadMore(true);
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
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (scrollDebounceRef.current) {
      clearTimeout(scrollDebounceRef.current);
      scrollDebounceRef.current = null;
    }
    
    setPosts([]);
    cursorRef.current = null;
    setHasMore(true);
    hasMoreRef.current = true;
    setInitialLoad(true);
    setError(null);
    loadingRef.current = false;
    lastLoadTimeRef.current = 0;
    retriesRef.current = 0;
    seenIdsRef.current.clear();
    
    loadMore(true); // Skip debounce for initial load
    
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
    };
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  return { posts, loading, hasMore, loadMore, initialLoad, error };
}