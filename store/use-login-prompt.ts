import { create } from 'zustand';

interface LoginPromptStore {
  isOpen: boolean;
  redirectTo: string;
  openLoginPrompt: (redirectTo?: string) => void;
  closeLoginPrompt: () => void;
}

export const useLoginPrompt = create<LoginPromptStore>((set) => ({
  isOpen: false,
  redirectTo: '/',
  openLoginPrompt: (redirectTo = '/') => set({ isOpen: true, redirectTo }),
  closeLoginPrompt: () => set({ isOpen: false }),
}));
