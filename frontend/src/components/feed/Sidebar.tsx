// components/feed/Sidebar.tsx
'use client';

import { useState } from 'react';

interface SidebarProps {
  onFilterChange?: (filter: string) => void;
  onCategoryChange?: (category: string) => void;
}

export function Sidebar({ onFilterChange, onCategoryChange }: SidebarProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filters = [
    { id: 'all', label: 'All Posts' },
    { id: 'trending', label: 'Trending' },
    { id: 'recent', label: 'Recent' },
    { id: 'top', label: 'Top Rated' },
  ];

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'music', label: 'Music' },
    { id: 'sports', label: 'Sports' },
    { id: 'education', label: 'Education' },
  ];

  const handleFilterClick = (filterId: string) => {
    setSelectedFilter(filterId);
    onFilterChange?.(filterId);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <aside 
      className="border rounded-lg p-4 sticky top-6"
      style={{
        backgroundColor: 'var(--color-surface-primary)',
        borderColor: 'var(--color-border-muted)'
      }}
    >
      <div className="mb-6">
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
      </div>

      <div>
        <h3 
          className="text-sm font-medium mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Categories
        </h3>
        <div className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors`}
              style={{
                backgroundColor: selectedCategory === category.id 
                  ? 'var(--color-action-secondary)' 
                  : 'transparent',
                color: selectedCategory === category.id
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-secondary)'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.id) {
                  e.currentTarget.style.backgroundColor = 'var(--color-action-secondary-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.id) {
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