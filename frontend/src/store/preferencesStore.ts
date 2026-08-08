import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    reservations: boolean;
    promotions: boolean;
    nouveautes: boolean;
  };
  confidentialite: {
    profilPublic: boolean;
    partagerAvis: boolean;
  };
}

const defaultPreferences: UserPreferences = {
  notifications: {
    email: true,
    push: true,
    reservations: true,
    promotions: false,
    nouveautes: true,
  },
  confidentialite: {
    profilPublic: false,
    partagerAvis: true,
  },
};

interface PreferencesState {
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
  toggleNotification: (key: keyof UserPreferences["notifications"]) => void;
  toggleConfidentialite: (key: keyof UserPreferences["confidentialite"]) => void;
  reset: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,

      setPreferences: (preferences) => set({ preferences }),

      toggleNotification: (key) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            notifications: {
              ...state.preferences.notifications,
              [key]: !state.preferences.notifications[key],
            },
          },
        })),

      toggleConfidentialite: (key) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            confidentialite: {
              ...state.preferences.confidentialite,
              [key]: !state.preferences.confidentialite[key],
            },
          },
        })),

      reset: () => set({ preferences: defaultPreferences }),
    }),
    {
      name: "user-preferences",
    }
  )
);