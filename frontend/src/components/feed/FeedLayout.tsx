// components/feed/FeedLayout.tsx
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface FeedLayoutProps {
  children: ReactNode;
  onFilterChange?: (filter: string) => void;
  onCategoryChange?: (category: string) => void;
}

export function FeedLayout({ children, onFilterChange, onCategoryChange }: FeedLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-20">
      <div className="flex gap-6">
        <aside className="w-64 flex-shrink-0 sticky top-20 h-fit">
          <Sidebar 
            onFilterChange={onFilterChange}
            onCategoryChange={onCategoryChange}
          />
        </aside>
        
        <main className="flex-1 max-w-2xl">
          {children}
        </main>
      </div>
    </div>
  );
}