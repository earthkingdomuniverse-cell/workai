import { Role, Timestamps } from '../../types/common';

export interface Profile extends Timestamps {
  id: string;
  userId: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  website?: string;
  headline?: string;
}

export interface ValueProfile extends Timestamps {
  id: string;
  userId: string;
  role: Role;
  skills: SkillItem[];
  goals: GoalItem[];
  completed: boolean;
  completedAt?: string;
  completionPercentage: number;
}

export interface SkillItem {
  id: string;
  name: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  verified?: boolean;
}

export interface GoalItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: 'active' | 'completed' | 'archived';
  priority?: 'low' | 'medium' | 'high';
}

export interface ProfileStats {
  completedDeals: number;
  totalReviews: number;
  averageRating: number;
  trustScore: number;
  trustLevel: string;
  responseRate: number;
  onTimeDelivery: number;
  repeatClients: number;
}

export interface VerificationStatus {
  email: boolean;
  phone: boolean;
  identity: boolean;
  paymentMethod: boolean;
  socialMedia: boolean;
  overallPercentage: number;
}

export interface ProfileSummary {
  profile: Profile;
  valueProfile: ValueProfile;
  stats: ProfileStats;
  verifications: VerificationStatus;
  recentReviews: any[];
  recentDeals: any[];
}
