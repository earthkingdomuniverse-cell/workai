import { Profile, OnboardingState, Skill, Goal } from './types';

interface ProfileRecord extends Profile {
  userId: string;
}

interface OnboardingRecord extends OnboardingState {
  userId: string;
}

export interface ProfileRepository {
  findByUserId(userId: string): Promise<ProfileRecord | null>;
  create(data: { userId: string }): Promise<Profile>;
  update(userId: string, data: Partial<Profile>): Promise<Profile>;

  findOnboardingByUserId(userId: string): Promise<OnboardingRecord | null>;
  createOnboarding(data: { userId: string; role: string }): Promise<OnboardingState>;
  updateOnboarding(userId: string, data: Partial<OnboardingState>): Promise<OnboardingState>;
  completeOnboarding(userId: string): Promise<OnboardingState>;
}

class InMemoryProfileRepository implements ProfileRepository {
  private profiles: Map<string, ProfileRecord> = new Map();
  private onboardings: Map<string, OnboardingRecord> = new Map();

  async findByUserId(userId: string): Promise<ProfileRecord | null> {
    const profile = Array.from(this.profiles.values()).find((p) => p.userId === userId);
    return profile || null;
  }

  async create(data: { userId: string }): Promise<Profile> {
    const id = `profile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    const profile: ProfileRecord = {
      id,
      userId: data.userId,
      displayName: null,
      bio: null,
      avatarUrl: null,
      location: null,
      website: null,
      createdAt: now,
      updatedAt: now,
    };

    this.profiles.set(id, profile);
    return profile;
  }

  async update(userId: string, data: Partial<Profile>): Promise<Profile> {
    const existing = await this.findByUserId(userId);
    if (!existing) {
      throw new Error(`Profile for user ${userId} not found`);
    }

    const updated: ProfileRecord = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.profiles.set(updated.id, updated);
    return updated;
  }

  async findOnboardingByUserId(userId: string): Promise<OnboardingRecord | null> {
    const onboarding = Array.from(this.onboardings.values()).find((o) => o.userId === userId);
    return onboarding || null;
  }

  async createOnboarding(data: { userId: string; role: string }): Promise<OnboardingState> {
    const id = `onboarding_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    const onboarding: OnboardingRecord = {
      id,
      userId: data.userId,
      role: data.role as any,
      displayName: null,
      bio: null,
      skills: [],
      goals: [],
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    this.onboardings.set(id, onboarding);
    return onboarding;
  }

  async updateOnboarding(userId: string, data: Partial<OnboardingState>): Promise<OnboardingState> {
    const existing = await this.findOnboardingByUserId(userId);
    if (!existing) {
      throw new Error(`Onboarding for user ${userId} not found`);
    }

    const updated: OnboardingRecord = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.onboardings.set(updated.id, updated);
    return updated;
  }

  async completeOnboarding(userId: string): Promise<OnboardingState> {
    const existing = await this.findOnboardingByUserId(userId);
    if (!existing) {
      throw new Error(`Onboarding for user ${userId} not found`);
    }

    const completed: OnboardingRecord = {
      ...existing,
      completed: true,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.onboardings.set(completed.id, completed);
    return completed;
  }
}

export const profileRepository: ProfileRepository = new InMemoryProfileRepository();
