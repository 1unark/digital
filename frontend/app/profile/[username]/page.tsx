// app/profile/[username]/page.tsx
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { UserVideos } from '@/components/profile/UserVideos';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <ProfileHeader username={username} />
      <UserVideos username={username} />
    </div>
  );
}