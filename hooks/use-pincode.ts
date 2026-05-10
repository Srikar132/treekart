"use client";

import { useState, useCallback, useRef } from "react";

export interface PostOffice {
    Name: string;
    Description: string | null;
    BranchType: string;
    DeliveryStatus: string;
    Circle: string;
    District: string;
    Division: string;
    Region: string;
    State: string;
    Country: string;
    Pincode: string;
    Taluk: string;
}

export interface PincodeData {
    Message: string;
    Status: "Success" | "Error";
    PostOffice: PostOffice[];
}

export function usePincode() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fetchController = useRef<AbortController | null>(null);

    const fetchPincodeData = useCallback(async (pin: string) => {
        if (pin.length !== 6) return null;

        if (fetchController.current) {
            fetchController.current.abort();
        }
        fetchController.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
                signal: fetchController.current.signal,
            });

            if (!res.ok) throw new Error("Network error. Please try again.");

            const data: PincodeData[] = await res.json();

            if (!data || data[0].Status !== "Success") {
                throw new Error("Invalid PIN code. Please double-check.");
            }

            const postOffices = data[0].PostOffice;
            if (!postOffices || postOffices.length === 0) {
                throw new Error("No data found for this PIN code.");
            }

            return postOffices;
        } catch (err: any) {
            if (err.name === "AbortError") return null;
            setError(err.message || "Could not fetch PIN data.");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { fetchPincodeData, loading, error };
}
