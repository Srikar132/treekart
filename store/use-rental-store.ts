import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Database } from "@/types/database.types";



export interface SelectedRentalPlan {
  treeId: string;
  planId: string;
  variety: string;
  price: number;
  yieldMinKg: number;
  yieldMaxKg: number;
  photos: string[];
  gpsLat: number;
  gpsLng: number;
}

interface RentalStore {
  selectedPlan: SelectedRentalPlan | null;
  setPlan: (plan: SelectedRentalPlan) => void;
  clearPlan: () => void;
}

export const useRentalStore = create<RentalStore>()(
  persist(
    (set) => ({
      selectedPlan: null,
      setPlan: (plan) => set({ selectedPlan: plan }),
      clearPlan: () => set({ selectedPlan: null }),
    }),
    {
      name: "treekart-rental-selection",
    }
  )
);
