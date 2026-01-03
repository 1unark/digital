import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { UserVideos } from '@/components/profile/UserVideos';

export default function ProfilePage({ params }: { params: { username: string } }) {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <ProfileHeader username={params.username} />
      <UserVideos username={params.username} />
    </div>
  );
}