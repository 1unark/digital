export interface User {
  id: number;
  username: string;
  email: string;
  total_points: number;
  bio: string;
  avatar: string | null;
}

export interface Post {
  id: string;
  user: User;
  video: string;
  thumbnail: string | null;
  caption: string;
  status: 'processing' | 'ready' | 'failed';
  plus_one_count: number;
  plus_two_count: number;
  total_score: number;
  created_at: string;
  userVote?: 1 | 2 | null;

}

export interface Vote {
  id: number;
  post: number;
  value: 1 | 2;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}