export interface User {
  id: string;
  email?: string;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
  user_metadata?: {
    [key: string]: any;
  };
  app_metadata?: {
    provider?: string;
    [key: string]: any;
  };
}
