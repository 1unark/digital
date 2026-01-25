export interface User {
  id: string;
  username: string;
  email: string;
  total_points: number;
  bio: string;
  avatar: string | null;
  is_following?: boolean;
}



export interface Post {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  author: {
    name: string;
    avatar: string | null;
    is_following?: boolean;
  };
  feedbackWanted: boolean;
  createdAt: string;
  likes: number;
  plusTwoCount: number;
  totalScore: number;
  viewCount: number;
  userVote: number | null;
  editingSoftware?: string;
  commentCount: number;
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

export interface LeaderboardEntry {
  user: {
    id: string;
    username: string;
    avatar?: string;
    bio?: string;

  };
  profile_picture?: string;
  avg_rating: number;
  rating_count: number;
  work_count: number;
  reputation_score: number;
}

export interface Category {
  id: number;
  label: string;
  slug: string;
  order: number;
  main_category_label: string;
  main_category_slug: string;
}


export interface PostComment {
  id: string;
  post: string;
  parent: string | null;
  content: string;
  author: {
    name: string;
    avatar: string | null;
    is_following: boolean;
  };
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  reply_count: number;
  is_author: boolean;
}
