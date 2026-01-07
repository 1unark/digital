// app/profile/[username]/page.tsx
import { Suspense } from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { UserVideos } from '@/components/profile/UserVideos';
import { userService } from '../../../src/services/user.service';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = await userService.getUserByUsername(username);
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <ProfileHeader username={username} />
      
      <Suspense fallback={<p>Loading videos...</p>}>
         <UserVideos userId={user.id} />
      </Suspense>
    </div>
  );
}