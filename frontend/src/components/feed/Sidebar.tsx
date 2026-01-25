// components/feed/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { postsService } from '../../services/posts.service';
import { Category } from '@/types/index';

interface SidebarProps {
  onFilterChange?: (mainCategories: string[], subCategories: string[]) => void;
}

interface CategoriesData {
  main_categories: Category[];
  categories: Category[];
}

let cachedData: CategoriesData | null = null;

export function Sidebar({ onFilterChange }: SidebarProps) {
  const router = useRouter();
  
  const [mainCategories, setMainCategories] = useState<Category[]>(cachedData?.main_categories || []);
  const [subCategories, setSubCategories] = useState<Category[]>(cachedData?.categories || []);
  const [loading, setLoading] = useState(!cachedData);

  useEffect(() => {
    if (cachedData) {
      return;
    }

    const loadCategories = async () => {
      try {
        const data = await postsService.getCategories();
        cachedData = data;
        setMainCategories(data.main_categories);
        setSubCategories(data.categories);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setMainCategories([]);
        setSubCategories([]);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleMainCategoryClick = (slug: string) => {
    router.push(`/feed/${slug}`);
  };

  const handleSubCategoryClick = (subSlug: string) => {
    const currentPath = window.location.pathname;
    const mainSlug = currentPath.split('/')[2] || mainCategories[0]?.slug || 'wip';
    router.push(`/feed/${mainSlug}/${subSlug}`);
  };

  return (
    <aside className="p-4 sticky top-6">
      <div className="mb-6">
        <h3 
          className="text-sm font-medium mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Works
        </h3>
        <div className="space-y-1">
          {!loading && mainCategories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleMainCategoryClick(cat.slug)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors`}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-action-secondary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 
          className="text-sm font-medium mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Categories
        </h3>
        <div className="space-y-1">
          {!loading && subCategories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleSubCategoryClick(cat.slug)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors`}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-action-secondary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}