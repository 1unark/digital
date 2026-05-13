// app/battles/page.tsx
'use client';

import { ComparisonVideoCard } from '@/components/feed/battles/ComparisonVideoCard';

export default function BattlesPage() {
  // Mock data - replace with actual backend data
  const mockBattles = [
    {
      id: '1',
      leftVideo: {
        id: 'left-1',
        videoUrl: 'https://example.com/video1.mp4',
        author: {
          name: 'creator_one',
          avatar: null,
        },
        votes: 142,
      },
      rightVideo: {
        id: 'right-1',
        videoUrl: 'https://example.com/video2.mp4',
        author: {
          name: 'creator_two',
          avatar: null,
        },
        votes: 89,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      leftVideo: {
        id: 'left-2',
        videoUrl: 'https://example.com/video3.mp4',
        author: {
          name: 'editor_pro',
          avatar: 'https://example.com/avatar1.jpg',
        },
        votes: 203,
      },
      rightVideo: {
        id: 'right-2',
        videoUrl: 'https://example.com/video4.mp4',
        author: {
          name: 'motion_master',
          avatar: 'https://example.com/avatar2.jpg',
        },
        votes: 178,
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Battles
          </h1>
          <p 
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
          </p>
        </header>

        <div className="space-y-4">
          {mockBattles.map((battle) => (
            <ComparisonVideoCard
              key={battle.id}
              leftVideo={battle.leftVideo}
              rightVideo={battle.rightVideo}
              createdAt={battle.createdAt}
            />
          ))}
        </div>
      </div>
    </div>
  );
}