// Maintenance mode — holds all visitors on the home page while work is in progress.
//
// Toggle with the MAINTENANCE_MODE env var (server-side only; no redeploy of code
// needed to turn it off, just change the value):
//   MAINTENANCE_MODE=true   → maintenance on
//   unset / anything else   → normal operation
//
// Read by the proxy (to gate routing) and by the home page (to show the banner),
// so both always agree.

/** Paths that stay reachable while maintenance mode is on. */
const MAINTENANCE_ALLOWED_PREFIXES = [
    "/admin", // admins must not lock themselves out of the dashboard
    "/api",   // webhooks (e.g. Razorpay) must keep fulfilling in-flight payments
];

export function isMaintenanceMode(): boolean {
    return process.env.MAINTENANCE_MODE === "true";
}

/** The home page plus the allow-listed prefixes above. */
export function isMaintenanceAllowedPath(pathname: string): boolean {
    if (pathname === "/") return true;
    return MAINTENANCE_ALLOWED_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
    );
}
