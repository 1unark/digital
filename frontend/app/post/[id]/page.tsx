import { VideoPlayer } from '@/components/post/VideoPlayer';

export default function PostPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <VideoPlayer postId={parseInt(params.id)} />
    </div>
  );
}