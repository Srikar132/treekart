import { create } from "zustand";

interface GuestPromoStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useGuestPromo = create<GuestPromoStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
