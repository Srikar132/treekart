import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type DeliveryAddress } from "@/types/checkout";

type DeliveryAddressStore = {
  address: DeliveryAddress;
  _hasHydrated: boolean;
  setAddress: (address: Partial<DeliveryAddress>) => void;
  setHasHydrated: (state: boolean) => void;
  resetAddress: () => void;
};

const INITIAL_ADDRESS: DeliveryAddress = {
  name: "",
  phone: "",
  line1: "",
  city: "",
  state: "Andhra Pradesh",
  pincode: "",
};

export const useDeliveryAddress = create<DeliveryAddressStore>()(
  persist(
    (set) => ({
      address: INITIAL_ADDRESS,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setAddress: (newAddress) =>
        set((state) => ({
          address: { ...state.address, ...newAddress },
        })),
      resetAddress: () => set({ address: INITIAL_ADDRESS }),
    }),
    {
      name: "treekart-delivery-address",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({ address: state.address }),
    }
  )
);
