// components/Leaderboard.tsx

"use client"

import { useLeaderboard } from '@/hooks/leaderboard/useLeaderboard';

export const Leaderboard = () => {
  const { leaderboard, loading, error } = useLeaderboard();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Leaderboard</h1>
      <ul>
        {leaderboard.map((entry, index) => (
          <li key={entry.user.id}>
            <span>{index + 1}. </span>
            <span>{entry.user.username}</span>
            <span> - Score: {entry.reputation_score.toFixed(2)}</span>
            <span> - Rating: {entry.avg_rating.toFixed(1)} ({entry.rating_count} ratings)</span>
            <span> - Works: {entry.work_count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};