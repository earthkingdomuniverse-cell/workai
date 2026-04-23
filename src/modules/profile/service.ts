import { profileRepository } from './repository';
import {
  Profile,
  ValueProfile,
  ProfileStats,
  VerificationStatus,
  ProfileSummary,
  SkillItem,
  GoalItem,
} from './types';
import { Role } from '../../types/common';
import { AppError } from '../../lib/errors';
import { mockReviews } from '../../mocks/reviews';
import { mockDeals } from '../../mocks/deals';
import { mockTrustProfiles } from '../../mocks/trust';

export async function getProfile(userId: string): Promise<Profile | null> {
  return profileRepository.findByUserId(userId);
}

export async function getValueProfile(userId: string): Promise<ValueProfile | null> {
  return profileRepository.findOnboardingByUserId(userId);
}

export async function upsertProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
  const existing = await profileRepository.findByUserId(userId);

  if (existing) {
    return profileRepository.update(userId, data);
  } else {
    await profileRepository.create({ userId });
    return profileRepository.update(userId, data);
  }
}

export async function upsertValueProfile(
  userId: string,
  data: Partial<ValueProfile> & { role?: Role },
): Promise<ValueProfile> {
  const existing = await profileRepository.findOnboardingByUserId(userId);

  if (!existing) {
    return profileRepository.createOnboarding({
      userId,
      role: data.role || 'member',
      displayName: data.displayName,
      bio: data.bio,
      skills: data.skills || [],
      goals: data.goals || [],
    });
  }

  const updateData: Partial<ValueProfile> = {};
  if (data.role) updateData.role = data.role;
  if (data.displayName !== undefined) updateData.displayName = data.displayName;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.skills) updateData.skills = data.skills;
  if (data.goals) updateData.goals = data.goals;
  if (data.completed !== undefined) updateData.completed = data.completed;

  return profileRepository.updateOnboarding(userId, updateData);
}

export async function completeValueProfile(userId: string): Promise<ValueProfile> {
  return profileRepository.completeOnboarding(userId);
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const userDeals = mockDeals.filter((d) => d.providerId === userId || d.clientId === userId);
  const userReviews = mockReviews.filter((r) => r.revieweeId === userId);

  const completedDeals = userDeals.filter((d) => d.status === 'completed').length;
  const averageRating =
    userReviews.length > 0
      ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length
      : 0;

  const trustProfile = mockTrustProfiles.find((t) => t.userId === userId);

  return {
    completedDeals,
    totalReviews: userReviews.length,
    averageRating: Math.round(averageRating * 10) / 10,
    trustScore: trustProfile?.score || 0,
    trustLevel: trustProfile?.level || 'bronze',
    responseRate: 95,
    onTimeDelivery: 90,
    repeatClients: 5,
  };
}

export async function getVerificationStatus(userId: string): Promise<VerificationStatus> {
  const trustProfile = mockTrustProfiles.find((t) => t.userId === userId);

  const verifications = trustProfile?.verifications || [];
  const emailVerified = verifications.some((v) => v.type === 'email' && v.status === 'verified');
  const phoneVerified = verifications.some((v) => v.type === 'phone' && v.status === 'verified');
  const identityVerified = verifications.some(
    (v) => v.type === 'identity' && v.status === 'verified',
  );
  const paymentVerified = verifications.some(
    (v) => v.type === 'payment_method' && v.status === 'verified',
  );
  const socialVerified = verifications.some(
    (v) => v.type === 'social_media' && v.status === 'verified',
  );

  const total = 5;
  const verified = [
    emailVerified,
    phoneVerified,
    identityVerified,
    paymentVerified,
    socialVerified,
  ].filter(Boolean).length;

  return {
    email: emailVerified,
    phone: phoneVerified,
    identity: identityVerified,
    paymentMethod: paymentVerified,
    socialMedia: socialVerified,
    overallPercentage: Math.round((verified / total) * 100),
  };
}

export async function getProfileSummary(userId: string): Promise<ProfileSummary> {
  const profile = await getProfile(userId);
  const valueProfile = await getValueProfile(userId);
  const stats = await getProfileStats(userId);
  const verifications = await getVerificationStatus(userId);

  const userReviews = mockReviews.filter((r) => r.revieweeId === userId).slice(0, 3);
  const userDeals = mockDeals
    .filter((d) => d.providerId === userId || d.clientId === userId)
    .slice(0, 3);

  return {
    profile: profile || {
      id: `profile_${userId}`,
      userId,
      displayName: '',
      bio: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    valueProfile: valueProfile || {
      id: `value_${userId}`,
      userId,
      role: 'member',
      skills: [],
      goals: [],
      completed: false,
      completionPercentage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    stats,
    verifications,
    recentReviews: userReviews,
    recentDeals: userDeals,
  };
}

export async function addSkill(userId: string, skill: SkillItem): Promise<ValueProfile> {
  const valueProfile = await getValueProfile(userId);

  if (!valueProfile) {
    throw new AppError('Value profile not found', { code: 'NOT_FOUND_ERROR' });
  }

  const updatedSkills = [...valueProfile.skills, skill];
  const completionPercentage = calculateCompletionPercentage(valueProfile.role, {
    ...valueProfile,
    skills: updatedSkills,
  });

  return profileRepository.updateOnboarding(userId, {
    skills: updatedSkills,
    completionPercentage,
  });
}

export async function removeSkill(userId: string, skillId: string): Promise<ValueProfile> {
  const valueProfile = await getValueProfile(userId);

  if (!valueProfile) {
    throw new AppError('Value profile not found', { code: 'NOT_FOUND_ERROR' });
  }

  const updatedSkills = valueProfile.skills.filter((s) => s.id !== skillId);
  const completionPercentage = calculateCompletionPercentage(valueProfile.role, {
    ...valueProfile,
    skills: updatedSkills,
  });

  return profileRepository.updateOnboarding(userId, {
    skills: updatedSkills,
    completionPercentage,
  });
}

export async function addGoal(userId: string, goal: GoalItem): Promise<ValueProfile> {
  const valueProfile = await getValueProfile(userId);

  if (!valueProfile) {
    throw new AppError('Value profile not found', { code: 'NOT_FOUND_ERROR' });
  }

  const updatedGoals = [...valueProfile.goals, goal];
  const completionPercentage = calculateCompletionPercentage(valueProfile.role, {
    ...valueProfile,
    goals: updatedGoals,
  });

  return profileRepository.updateOnboarding(userId, {
    goals: updatedGoals,
    completionPercentage,
  });
}

export async function removeGoal(userId: string, goalId: string): Promise<ValueProfile> {
  const valueProfile = await getValueProfile(userId);

  if (!valueProfile) {
    throw new AppError('Value profile not found', { code: 'NOT_FOUND_ERROR' });
  }

  const updatedGoals = valueProfile.goals.filter((g) => g.id !== goalId);
  const completionPercentage = calculateCompletionPercentage(valueProfile.role, {
    ...valueProfile,
    goals: updatedGoals,
  });

  return profileRepository.updateOnboarding(userId, {
    goals: updatedGoals,
    completionPercentage,
  });
}

function calculateCompletionPercentage(role: Role, valueProfile: ValueProfile): number {
  let points = 0;
  const maxPoints = 5;

  if (valueProfile.displayName) points++;
  if (valueProfile.bio && valueProfile.bio.length > 50) points++;
  if (valueProfile.skills.length > 0) points++;
  if (valueProfile.goals.length > 0) points++;
  if (valueProfile.completed) points++;

  return Math.round((points / maxPoints) * 100);
}
