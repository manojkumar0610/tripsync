import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppStore {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Active trip tab memory
  lastTripTab: Record<string, string>;
  setLastTripTab: (tripId: string, tab: string) => void;

  // Expense view preference
  expenseView: "list" | "balances";
  setExpenseView: (v: "list" | "balances") => void;

  // Notification panel
  notificationPanelOpen: boolean;
  setNotificationPanelOpen: (open: boolean) => void;

  // Onboarding
  onboardingComplete: boolean;
  setOnboardingComplete: () => void;

  // Theme preference (synced with next-themes but stored here too)
  preferredCurrency: string;
  setPreferredCurrency: (c: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      lastTripTab: {},
      setLastTripTab: (tripId, tab) =>
        set((s) => ({ lastTripTab: { ...s.lastTripTab, [tripId]: tab } })),

      expenseView: "list",
      setExpenseView: (v) => set({ expenseView: v }),

      notificationPanelOpen: false,
      setNotificationPanelOpen: (open) =>
        set({ notificationPanelOpen: open }),

      onboardingComplete: false,
      setOnboardingComplete: () => set({ onboardingComplete: true }),

      preferredCurrency: "USD",
      setPreferredCurrency: (c) => set({ preferredCurrency: c }),
    }),
    {
      name: "tripsync-app-store",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        lastTripTab: s.lastTripTab,
        expenseView: s.expenseView,
        onboardingComplete: s.onboardingComplete,
        preferredCurrency: s.preferredCurrency,
      }),
    }
  )
);
