// components/upload/CategorySelect.tsx
'use client';

import { useState, useEffect } from 'react';
import { postsService } from '../../services/posts.service';
import { Category } from '@/types/index';

interface CategoriesData {
  main_categories: Category[];
  categories: Category[];
}

let cachedData: CategoriesData | null = null;

interface CategorySelectProps {
  mainCategory: Category | null;
  subCategory: Category | null;
  onMainCategoryChange: (category: Category | null) => void;
  onSubCategoryChange: (category: Category | null) => void;
  disabled?: boolean;
}

export function CategorySelect({ 
  mainCategory, 
  subCategory, 
  onMainCategoryChange, 
  onSubCategoryChange, 
  disabled 
}: CategorySelectProps) {
  const [mainCategories, setMainCategories] = useState<Category[]>(cachedData?.main_categories || []);
  const [subCategories, setSubCategories] = useState<Category[]>(cachedData?.categories || []);

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
      }
    };
    loadCategories();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Work Type *
        </label>
        <select
          value={mainCategory?.slug || ""} 
          onChange={(e) => {
            const selectedSlug = e.target.value;
            const selectedObj = mainCategories.find(cat => cat.slug === selectedSlug);
            onMainCategoryChange(selectedObj || null);
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
          <option value="">Select work type</option>
          {mainCategories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Category *
        </label>
        <select
          value={subCategory?.slug || ""} 
          onChange={(e) => {
            const selectedSlug = e.target.value;
            const selectedObj = subCategories.find(cat => cat.slug === selectedSlug);
            onSubCategoryChange(selectedObj || null);
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
          {subCategories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.label}
            </option>
          ))}
        </select>
        <p 
          className="text-xs mt-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Have a category suggestion? Email lxn4766@gmail.com
        </p>
      </div>
    </div>
  );
}