// app/feed/page.tsx
'use client';

import { FeedContainer } from '@/components/feed/FeedContainer';
import { FeedLayout } from '@/components/feed/FeedLayout';

export default function FeedPage() {
  const handleFilterChange = (filter: string) => {
    console.log('Filter changed:', filter);
  };

  const handleCategoryChange = (category: string) => {
    console.log('Category changed:', category);
  };

  return (
    <FeedLayout 
      onFilterChange={handleFilterChange}
      onCategoryChange={handleCategoryChange}
    >
      <FeedContainer />
    </FeedLayout>
  );
}