import arcjet, { slidingWindow, tokenBucket, shield } from "@arcjet/next";

const base = arcjet({
    key: process.env.ARCJET_KEY!,
    characteristics: ["ip.src"],
    rules: [shield({ mode: "LIVE" })],
});

export const authAj = base.withRule(slidingWindow({ mode: "LIVE", interval: "1m", max: 5 }));
export const signupAj = base.withRule(slidingWindow({ mode: "LIVE", interval: "1h", max: 3 }));
export const contactAj = base.withRule(slidingWindow({ mode: "LIVE", interval: "1h", max: 5 }));
export const paymentAj = base.withRule(tokenBucket({ mode: "LIVE", refillRate: 2, interval: "1m", capacity: 5 }));