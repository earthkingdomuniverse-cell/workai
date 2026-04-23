import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type OnboardingRole = 'member' | 'operator' | 'admin';

interface OnboardingState {
  role: OnboardingRole | null;
  displayName: string;
  bio: string;
  skills: string[];
  goals: string[];
}

interface OnboardingActions {
  setRole: (role: OnboardingRole) => void;
  setProfile: (payload: { displayName: string; bio: string }) => void;
  setSkills: (skills: string[]) => void;
  setGoals: (goals: string[]) => void;
  reset: () => void;
}

const initialState: OnboardingState = {
  role: null,
  displayName: '',
  bio: '',
  skills: [],
  goals: [],
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set) => ({
      ...initialState,
      setRole: (role) => set({ role }),
      setProfile: ({ displayName, bio }) => set({ displayName, bio }),
      setSkills: (skills) => set({ skills }),
      setGoals: (goals) => set({ goals }),
      reset: () => set(initialState),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
