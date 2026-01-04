// hooks/useUserProfile.ts
import { useState, useEffect } from 'react';
import { userService } from '../../services/user.service';
import { User } from '@/types/index';

export function useUserProfile(username: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await userService.getUserByUsername(username);
        setUser(userData);
        setError(null);
      } catch (err) {
        setError('Failed to load user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  return { user, loading, error };
}