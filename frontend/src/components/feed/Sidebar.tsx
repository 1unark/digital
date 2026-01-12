// components/feed/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { postsService } from '../../services/posts.service';
import { Category } from '@/types/index';

interface SidebarProps {
  onFilterChange?: (filter: string) => void;
  onCategoryChange?: (category: string) => void;
}

let cachedCategories: Category[] | null = null;

export function Sidebar({ onFilterChange, onCategoryChange }: SidebarProps) {
  const router = useRouter();
  const params = useParams();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [categories, setCategories] = useState<Category[]>(cachedCategories || []);
  const [loading, setLoading] = useState(!cachedCategories);

  const currentCategory = (params?.category as string) || 'all';

  const filters = [
    { id: 'all', label: 'All Posts' },
    { id: 'recent', label: 'Recent' },
    { id: 'top', label: 'Top Rated' },
  ];

  useEffect(() => {
    if (cachedCategories) {
      return;
    }

    const loadCategories = async () => {
      try {
        const data = await postsService.getCategories();
        const categoryList = Array.isArray(data) 
          ? data.filter(cat => !['all', 'other'].includes(cat.slug)) 
          : [];
        cachedCategories = categoryList;
        setCategories(categoryList);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleFilterClick = (filterId: string) => {
    setSelectedFilter(filterId);
    onFilterChange?.(filterId);
  };

  const handleCategoryClick = (categorySlug: string) => {
    onCategoryChange?.(categorySlug);
    router.push(`/feed/${categorySlug}`);
  };

  return (
    <aside className="p-4 sticky top-6">
      {/* <div className="mb-6">
        <h3 
          className="text-sm font-medium mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Filter
        </h3>
        <div className="space-y-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter.id)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors`}
              style={{
                backgroundColor: selectedFilter === filter.id 
                  ? 'var(--color-action-secondary)' 
                  : 'transparent',
                color: selectedFilter === filter.id
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-secondary)'
              }}
              onMouseEnter={(e) => {
                if (selectedFilter !== filter.id) {
                  e.currentTarget.style.backgroundColor = 'var(--color-action-secondary-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFilter !== filter.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div> */}

      <div>
        <h3 
          className="text-sm font-medium mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Categories
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => handleCategoryClick('all')}
            className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors`}
            style={{
              backgroundColor: currentCategory === 'all' 
                ? 'var(--color-action-secondary)' 
                : 'transparent',
              color: currentCategory === 'all'
                ? 'var(--color-text-primary)'
                : 'var(--color-text-secondary)'
            }}
            onMouseEnter={(e) => {
              if (currentCategory !== 'all') {
                e.currentTarget.style.backgroundColor = 'var(--color-action-secondary-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentCategory !== 'all') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            All Projects
          </button>
          {!loading && categories.map((category) => (
            <button
              key={category.slug}
              onClick={() => handleCategoryClick(category.slug)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors`}
              style={{
                backgroundColor: currentCategory === category.slug 
                  ? 'var(--color-action-secondary)' 
                  : 'transparent',
                color: currentCategory === category.slug
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-secondary)'
              }}
              onMouseEnter={(e) => {
                if (currentCategory !== category.slug) {
                  e.currentTarget.style.backgroundColor = 'var(--color-action-secondary-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentCategory !== category.slug) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}