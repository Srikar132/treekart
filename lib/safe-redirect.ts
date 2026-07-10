// Open-redirect guard.
//
// `redirectTo` reaches us from the query string, so it is attacker-controlled.
// Without this, /auth/signin?redirectTo=https://evil.com turns the sign-in page
// into a phishing primitive: the user authenticates on our domain and is then
// handed to someone else's.
//
// Only same-origin, root-relative paths are allowed. Everything else falls back.

const DEFAULT_DESTINATION = "/";

export function safeRedirect(
    value: string | null | undefined,
    fallback: string = DEFAULT_DESTINATION
): string {
    if (!value) return fallback;

    // Must start with a single "/" — rejects "https://evil.com" and,
    // critically, the protocol-relative "//evil.com" which browsers treat as absolute.
    if (!value.startsWith("/") || value.startsWith("//")) return fallback;

    // "/\evil.com" is normalized to "//evil.com" by some browsers.
    if (value.startsWith("/\\")) return fallback;

    // A path that still parses as absolute against a foreign base is not relative.
    try {
        const probe = new URL(value, "https://placeholder.invalid");
        if (probe.origin !== "https://placeholder.invalid") return fallback;
        return `${probe.pathname}${probe.search}${probe.hash}`;
    } catch {
        return fallback;
    }
}
