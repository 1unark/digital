// app/leaderboard/page.tsx
export const runtime = 'edge';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';

export default function LeaderboardPage() {
  return (
    <div className="pt-14">
      <Leaderboard />
    </div>
  );
}