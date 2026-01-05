// app/feed/page.tsx
'use client';

import { FeedContainer } from '@/components/feed/FeedContainer';
import { Sidebar } from '@/components/feed/Sidebar';

export default function FeedPage() {
  const handleFilterChange = (filter: string) => {
    console.log('Filter changed:', filter);
  };

  const handleCategoryChange = (category: string) => {
    console.log('Category changed:', category);
  };

  return (
    <div className="min-h-screen relative">
      {/* Feed - always centered, with top padding for navbar */}
      <div className="mx-auto px-4 pt-20" style={{ width: '672px' }}>
        <FeedContainer />
      </div>
      
      {/* Sidebar - fixed to the left of the feed */}
      <aside 
        className="hidden xl:block fixed w-56 z-10" 
        style={{
          left: 'calc(50% - 336px - 280px)', // 50% - (half feed width) - (sidebar width + gap)
          top: '80px' // Below the navbar
        }}
      >
        <Sidebar 
          onFilterChange={handleFilterChange}
          onCategoryChange={handleCategoryChange}
        />
      </aside>
    </div>
  );
}