// components/feed/FeedLayout.tsx
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface FeedLayoutProps {
  children: ReactNode;
  centered?: boolean;
  onFilterChange?: (filter: string) => void;
  onCategoryChange?: (category: string) => void;
}

export function FeedLayout({ children, centered = false, onFilterChange, onCategoryChange }: FeedLayoutProps) {
  if (centered) {
    return (
      <div className="min-h-screen relative">
        <div className="mx-auto px-4 pt-20" style={{ width: '800px' }}>
          {children}
        </div>
        
        <aside 
          className="hidden xl:block fixed w-56 z-10" 
          style={{
            left: 'calc(50% - 345px - 280px)',
            top: '80px'
          }}
        >
          <Sidebar 
            onFilterChange={onFilterChange}
            onCategoryChange={onCategoryChange}
          />
        </aside>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-64 flex-shrink-0">
        <Sidebar 
          onFilterChange={onFilterChange}
          onCategoryChange={onCategoryChange}
        />
      </div>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}