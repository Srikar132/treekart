"use client";

import { useEffect, useState, useCallback } from "react";

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
    handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
    }) => void;
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
    // Initialize state from window if available to avoid extra render on mount
    const [loaded, setLoaded] = useState(() => 
        typeof window !== "undefined" && !!window.Razorpay
    );

    useEffect(() => {
        // If already loaded via initial state or previous mount, we're done
        if (loaded) return;

        // Otherwise, poll for it since it might be lazy-loaded via script tag
        const interval = setInterval(() => {
            if (window.Razorpay) {
                setLoaded(true);
                clearInterval(interval);
            }
        }, 500);

        // Stop polling after 10 seconds to save resources
        const timeout = setTimeout(() => {
            clearInterval(interval);
        }, 10000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [loaded]);

    const openRazorpay = useCallback((options: {
        key: string;
        amount: number;
        currency: string;
        name: string;
        description: string;
        order_id: string;
        prefill?: { name?: string; email?: string; contact?: string };
        onSuccess: (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
        }) => void;
        onDismiss?: () => void;
    }) => {
        if (!loaded || !window.Razorpay) {
            alert("Payment gateway not loaded. Please try again.");
            return;
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
    }, [loaded]);

    return { loaded, openRazorpay };
}