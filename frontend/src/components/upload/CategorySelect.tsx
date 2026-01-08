// components/upload/CategorySelect.tsx
'use client';

import { useState, useEffect } from 'react';
import { postsService } from '../../services/posts.service';
import { Category } from '@/types/index';

let cachedCategories: Category[] | null = null;

interface CategorySelectProps {
  value: Category | null;
  onChange: (category: Category | null) => void;
  disabled?: boolean;
}

export function CategorySelect({ value, onChange, disabled }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>(cachedCategories || []);

  useEffect(() => {
    if (cachedCategories) {
      return;
    }

    const loadCategories = async () => {
      try {
        const data = await postsService.getCategories();
        const categoryList = Array.isArray(data) ? data : [];
        cachedCategories = categoryList;
        setCategories(categoryList);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  return (
    <div>
      <label 
        className="block text-sm font-medium mb-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Category *
      </label>
      <select
        value={value?.slug || ""} 
        onChange={(e) => {
          const selectedSlug = e.target.value;
          const selectedObj = categories.find(cat => cat.slug === selectedSlug);
          onChange(selectedObj || null);
        }}
        disabled={disabled}
        className="w-full px-3 py-2 border rounded text-sm transition-colors"
        style={{
          backgroundColor: 'var(--color-surface-primary)',
          borderColor: 'var(--color-border-default)',
          color: 'var(--color-text-primary)',
          opacity: disabled ? '0.5' : '1'
        }}
      >
        <option value="">Select a category</option>
        {categories.filter(cat => cat.slug !== 'all').map((cat) => (
          <option key={cat.slug} value={cat.slug}>
            {cat.label}
          </option>
        ))}
        <option value="other">Other</option>
      </select>
      <p 
        className="text-xs mt-1"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Have a category suggestion? Email lxn4766@gmail.com
      </p>
    </div>
  );
}