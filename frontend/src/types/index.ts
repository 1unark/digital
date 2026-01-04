export interface User {
  id: string;
  username: string;
  email: string;
  total_points: number;
  bio: string;
  avatar: string | null;
}

export interface Post {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  author: {
    name: string;
    avatar: string | null;
  };
  createdAt: string;
  likes: number;
  plusTwoCount: number;
  totalScore: number;
  views: number;
  userVote: number | null;
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