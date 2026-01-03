import { FeedContainer } from '@/components/feed/FeedContainer';

export default function FeedPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Feed</h1>
      <FeedContainer />
    </div>
  );
}