import type { QueryClient } from "@tanstack/react-query";
import { useMangoCart } from "@/store/use-mango-cart";
import { useRentalStore } from "@/store/use-rental-store";
import { useDeliveryAddress } from "@/store/use-delivery-address";

// Wipe every trace of the previous session from the browser on logout.
//
// Signing the session cookie out is not enough: React Query still holds the
// last user's fetched data, and the Zustand stores keep cart / rental / address
// in memory AND mirrored in localStorage. A client-side navigation after logout
// does NOT reload the page, so that state survives — the next person on the same
// browser would see the previous user's cart and delivery address. This clears
// both the in-memory store state and its persisted localStorage entry.
//
// Client-only. Call it right after the auth sign-out, before redirecting.
export function clearClientState(queryClient?: QueryClient) {
    // 1. React Query — drop all cached server data (orders, profile, etc.).
    queryClient?.clear();

    // 2. Zustand — reset in-memory state first (a client nav won't reload the
    //    page), then remove each store's persisted localStorage key.
    try {
        useMangoCart.getState().clear();
        useRentalStore.getState().clearPlan();
        useDeliveryAddress.getState().resetAddress();
        useMangoCart.persist?.clearStorage();
        useRentalStore.persist?.clearStorage();
        useDeliveryAddress.persist?.clearStorage();
    } catch {
        // Never let a storage hiccup block the logout redirect.
    }

    // 3. Stray auth artifacts in web storage (the in-flight OTP phone).
    if (typeof window !== "undefined") {
        try {
            sessionStorage.removeItem("treekart-pending-phone");
        } catch {
            // ignore
        }
    }
}
