import { Wrench } from "lucide-react";

/**
 * Shown on the home page while MAINTENANCE_MODE is on.
 * All other routes are redirected here by the proxy, so this is the only
 * page a visitor can reach — the copy has to explain that clearly.
 */
export function MaintenanceBanner() {
    return (
        <section
            role="status"
            aria-live="polite"
            className="w-full border-b-4 border-mango bg-mango/10"
        >
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 py-10 text-center md:py-12">
                <div className="inline-flex items-center justify-center border border-mango bg-mango/20 p-3">
                    <Wrench size={24} className="text-grove" />
                </div>

                <h2 className="text-2xl font-bold uppercase tracking-tight text-grove md:text-3xl">
                    We&apos;re Upgrading TreeKart
                </h2>

                <p className="max-w-2xl text-sm leading-relaxed text-foreground md:text-base">
                    Our website is temporarily under maintenance while we roll out an
                    important update. Browsing trees, placing orders, and signing in are
                    unavailable right now.
                </p>

                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    We&apos;ll be back shortly — thank you for your patience
                </p>
            </div>
        </section>
    );
}
