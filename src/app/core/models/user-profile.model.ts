export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  membershipType?: 'basic' | 'premium' | 'elite';
  joinDate?: string;
  avatarUrl?: string;
}
