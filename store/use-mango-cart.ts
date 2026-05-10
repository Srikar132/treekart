import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Database } from "@/types/database.types";

export type ProductBadge = Database["public"]["Enums"]["product_badge"];

export type CartItem = {
    id: string;
    name: string;
    variety: string;
    pricePerKg: number; // For backward compatibility with order.actions.ts
    price: number; // Direct product price mapping
    qty: number;
    imageUrl: string;
    badge?: ProductBadge | null;
    weightKg?: number | null;
    status?: Database["public"]["Enums"]["product_status"] | null;
};

// What gets persisted to localStorage
type PersistedState = {
    items: CartItem[];
};

type MangoCartStore = PersistedState & {
    // UI state — NOT persisted
    isOpen: boolean;
    _hasHydrated: boolean;

    // Actions
    add: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
    remove: (id: string, weightKg?: number | null) => void;
    updateQty: (id: string, qty: number, weightKg?: number | null) => void;
    clear: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    setHasHydrated: (state: boolean) => void;
    updateStatuses: (statuses: Record<string, Database["public"]["Enums"]["product_status"]>) => void;

    // Computed — call as functions
    totalItems: () => number;
    totalQty: () => number;
    totalPrice: () => number;
    totalWithDelivery: () => number;
    deliveryFee: () => number;
    isEmpty: () => boolean;
};

const FREE_DELIVERY_THRESHOLD = 999;
const DELIVERY_FEE = 99;

export const useMangoCart = create<MangoCartStore>()(
    persist(
        (set, get) => ({
            // ── State ──────────────────────────────────────────
            items: [],
            isOpen: false,
            _hasHydrated: false,

            // ── Hydration guard ────────────────────────────────
            setHasHydrated: (state) => set({ _hasHydrated: state }),

            // ── Mutations ──────────────────────────────────────
            add: (item) => {
                const { qty = 1, ...rest } = item;
                set((s) => {
                    const existing = s.items.find(
                        (i) => i.id === rest.id && i.weightKg === rest.weightKg
                    );
                    return {
                        items: existing
                            ? s.items.map((i) =>
                                i.id === rest.id && i.weightKg === rest.weightKg
                                    ? { ...i, qty: i.qty + qty }
                                    : i
                            )
                            : [...s.items, { ...rest, qty }],
                        isOpen: true, // auto-open on add
                    };
                });
            },

            remove: (id, weightKg) =>
                set((s) => ({
                    items: s.items.filter(
                        (i) => !(i.id === id && i.weightKg === weightKg)
                    ),
                })),

            updateQty: (id, qty, weightKg) => {
                if (qty <= 0) {
                    get().remove(id, weightKg);
                    return;
                }
                set((s) => ({
                    items: s.items.map((i) =>
                        i.id === id && i.weightKg === weightKg ? { ...i, qty } : i
                    ),
                }));
            },

            clear: () => set({ items: [], isOpen: false }),

            // ── UI ─────────────────────────────────────────────
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
            updateStatuses: (statuses) => set((s) => ({
                items: s.items.map(item => ({
                    ...item,
                    status: statuses[item.id] || item.status
                }))
            })),

            // ── Computed ───────────────────────────────────────
            isEmpty: () => get().items.length === 0,

            totalItems: () =>
                get().items.reduce((sum, i) => sum + (i.qty * (i.weightKg || 0)), 0),

            totalQty: () =>
                get().items.reduce((sum, i) => sum + i.qty, 0),

            totalPrice: () =>
                get().items.reduce(
                    (sum, i) => sum + i.price * i.qty,
                    0
                ),

            deliveryFee: () =>
                get().totalPrice() >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE,

            totalWithDelivery: () =>
                get().totalPrice() + get().deliveryFee(),
        }),
        {
            name: "treekart-mango-cart",
            storage: createJSONStorage(() => localStorage),

            // Only persist items — never persist isOpen or _hasHydrated
            partialize: (s): PersistedState => ({ items: s.items }),

            // Fire after localStorage is read and state is rehydrated
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);