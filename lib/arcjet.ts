import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";

/**
 * Public/Global Arcjet instance.
 * Uses IP-based rate limiting for sign-in, sign-up, and public pages.
 */
export const aj = arcjet({
    key: process.env.ARCJET_KEY!,
    rules: [
        shield({ mode: "LIVE" }),
        detectBot({
            mode: "LIVE",
            allow: ["CATEGORY:SEARCH_ENGINE"],
        }),
        tokenBucket({
            mode: "LIVE",
            characteristics: ["ip.src"], // track requests by IP
            refillRate: 5,
            interval: 10,
            capacity: 10,
        }),
    ],
});

/**
 * Authenticated Arcjet instance.
 * Uses userId-based rate limiting for protected routes (/account, /checkout, etc).
 */
export const authenticatedAj = arcjet({
    key: process.env.ARCJET_KEY!,
    rules: [
        shield({ mode: "LIVE" }),
        tokenBucket({
            mode: "LIVE",
            characteristics: ["userId"], // track requests by user ID
            refillRate: 10,
            interval: 10,
            capacity: 20,
        }),
    ],
});