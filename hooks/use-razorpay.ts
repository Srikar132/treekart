"use client";

import { useEffect, useState, useCallback } from "react";

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill?: { name?: string; email?: string; contact?: string };
    theme?: { color?: string };
    modal?: { ondismiss?: () => void };
    handler: (response: RazorpayResponse) => void;
}

interface RazorpayInstance {
    open: () => void;
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

export function useRazorpay() {
    // Initialise from window immediately if the script was already loaded
    // (e.g. navigating back to a page after a previous checkout).
    const [loaded, setLoaded] = useState(
        () => typeof window !== "undefined" && typeof window.Razorpay === "function"
    );

    useEffect(() => {
        if (loaded) return;

        // Poll every 500 ms — the Razorpay script is loaded via a <Script> tag
        // in the layout and may not be ready synchronously.
        const interval = setInterval(() => {
            if (typeof window.Razorpay === "function") {
                setLoaded(true);
                clearInterval(interval);
            }
        }, 500);

        // Give up after 15 seconds to avoid polling forever on slow connections.
        const timeout = setTimeout(() => clearInterval(interval), 15_000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [loaded]);

    const openRazorpay = useCallback(
        (options: {
            key: string;
            amount: number;
            currency: string;
            name: string;
            description: string;
            order_id: string;
            prefill?: { name?: string; email?: string; contact?: string };
            onSuccess: (response: RazorpayResponse) => void;
            onDismiss?: () => void;
        }) => {
            // FIX: throw instead of alert so callers can catch and display a proper toast
            if (!loaded || typeof window.Razorpay !== "function") {
                throw new Error(
                    "Payment gateway is not ready yet. Please wait a moment and try again."
                );
            }

            const rzp = new window.Razorpay({
                key: options.key,
                amount: options.amount,
                currency: options.currency,
                name: options.name,
                description: options.description,
                order_id: options.order_id,
                prefill: options.prefill ?? {},
                theme: { color: "#2d8a1a" },
                modal: {
                    ondismiss: options.onDismiss,
                },
                handler: options.onSuccess,
            });

            rzp.open();
        },
        [loaded]
    );

    return { loaded, openRazorpay };
}