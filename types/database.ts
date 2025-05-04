export type Occupation = 'educator' | 'student' | 'hobbyist' | 'professional' | 'other';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface User {
  id: string;
  email: string;
  full_name: string;
  age: number;
  gender: Gender;
  occupation: Occupation;
  country: string;
  interests: string[];
  usage_purpose: string;
  created_at: string;
  updated_at: string;
}

export interface UserStatistics {
  user_id: string;
  total_generations: number;
  tokens_used: number;
  tokens_remaining: number;
  account_tier: string;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  confidence_score: number;
  processing_time: number;
  tokens_used: number;
  created_at: string;
  user: {
    email: string;
  };
}
