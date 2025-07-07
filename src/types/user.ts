// src/types/user.ts
export type UserRole = 'user_host' | 'user_client';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  avatar_url?: string;
}
