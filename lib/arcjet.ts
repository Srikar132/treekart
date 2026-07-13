import arcjet, { slidingWindow, tokenBucket, shield } from "@arcjet/next";

const base = arcjet({
    key: process.env.ARCJET_KEY!,
    characteristics: ["ip.src"],
    rules: [shield({ mode: "LIVE" })],
});

export const authAj = base.withRule(slidingWindow({ mode: "LIVE", interval: "1m", max: 5 }));

// OTP send — every SMS costs money. Layered under CAPTCHA + Supabase's own sms_sent cap.
//
// Keyed on the PHONE NUMBER, not the IP. Indian mobile carriers (Jio, Airtel, …)
// route huge subscriber pools through shared CGNAT IPs, so an IP-keyed limit
// throttles innocent users who merely share a carrier. The phone number is the
// real subject of an OTP send, so limit per number.
export const otpSendAj = arcjet({
    key: process.env.ARCJET_KEY!,
    characteristics: ["phone"],
    rules: [
        shield({ mode: "LIVE" }),
        slidingWindow({ mode: "LIVE", interval: "10m", max: 5 }),
    ],
});

// OTP verify — brute-force guard. A 6-digit code is 1e6 combinations; Supabase
// caps attempts-per-code but adds no per-number ceiling across codes. Keying on
// the phone bounds total guesses against one number no matter how many IPs an
// attacker rotates through.
export const otpVerifyAj = arcjet({
    key: process.env.ARCJET_KEY!,
    characteristics: ["phone"],
    rules: [slidingWindow({ mode: "LIVE", interval: "10m", max: 6 })],
});

// Coarse IP backstop for OTP send: stops a single host enumerating many numbers,
// but set generously so a shared CGNAT IP does not block legitimate users.
export const otpIpBackstopAj = base.withRule(
    slidingWindow({ mode: "LIVE", interval: "10m", max: 20 })
);
// Recovery-code redemption — brute-force guard on a high-value action.
export const recoveryAj = base.withRule(slidingWindow({ mode: "LIVE", interval: "15m", max: 5 }));
export const signupAj = base.withRule(slidingWindow({ mode: "LIVE", interval: "1h", max: 3 }));
export const contactAj = base.withRule(slidingWindow({ mode: "LIVE", interval: "1h", max: 5 }));
export const paymentAj = base.withRule(tokenBucket({ mode: "LIVE", refillRate: 2, interval: "1m", capacity: 5 }));