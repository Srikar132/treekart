import { ShieldAlert, Timer, Bot, Home, MessageCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface BlockedContentProps {
    reason: string | null;
}

export function BlockedContent({ reason }: BlockedContentProps) {
    const isRateLimit = reason === "RATE_LIMIT";
    const isBot = reason === "BOT";

    const config = {
        badge: isRateLimit ? "Rate Limit Active" : isBot ? "Security Event" : "System Alert",
        title: isRateLimit ? "Too Many Requests" : isBot ? "Access Restricted" : "Connection Blocked",
        subtitle: isRateLimit ? "Slow Down" : isBot ? "Verification Required" : "Security Check",
        description: isRateLimit
            ? "Our systems have detected an unusually high volume of requests from your connection. To ensure stability for all orchard members, we've temporarily paused your access."
            : isBot
                ? "Our security shield has flagged this connection for automated behavior. If you believe this is an error, please reach out to our team."
                : "Access to this resource is currently restricted by our security protocols. This might be due to a temporary maintenance window or a security event.",
        icon: isRateLimit ? (
            <Timer className="w-10 h-10 text-accent" />
        ) : isBot ? (
            <Bot className="w-10 h-10 text-primary" />
        ) : (
            <ShieldAlert className="w-10 h-10 text-destructive" />
        ),
        accentColor: isRateLimit ? "bg-accent" : isBot ? "bg-primary" : "bg-destructive",
        accentText: isRateLimit ? "text-accent" : isBot ? "text-primary" : "text-destructive",
        accentBg: isRateLimit ? "bg-accent/10" : isBot ? "bg-primary/10" : "bg-destructive/10",
    };

    return (
        <div className="relative z-10 w-full max-w-2xl mx-auto px-4">
            <div className="bg-card border border-border rounded-none p-8 md:p-12 shadow-sm">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-none bg-secondary/50 border border-border">
                        <div className={`w-1.5 h-1.5 rounded-full ${config.accentColor}`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/80">
                            {config.badge}
                        </span>
                    </div>

                    <div className="relative mb-10">
                        <div className={`absolute inset-0 blur-3xl rounded-full ${config.accentColor}/5`} />
                        <div className="relative flex items-center justify-center w-24 h-24 rounded-none bg-background border border-border shadow-sm group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
                            <div>
                                {config.icon}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-lg">
                        <h2 className={`text-[10px] font-black uppercase tracking-[0.4em] ${config.accentText} italic`}>
                            {config.subtitle}
                        </h2>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground leading-none">
                            {config.title}
                        </h1>
                        <p className="text-sm md:text-base font-medium text-muted-foreground leading-relaxed pt-2">
                            {config.description}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-border pt-10">
                    <Link href="/" className="w-full sm:w-auto">
                        <Button
                            variant="default"
                            className="w-full sm:w-56 h-14 rounded-none bg-foreground text-background hover:bg-foreground/90 uppercase tracking-widest text-[9px] font-black"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Return to Safety
                        </Button>
                    </Link>
                    <Link href="/contact" className="w-full sm:w-auto">
                        <Button
                            variant="outline"
                            className="w-full sm:w-56 h-14 rounded-none border-border uppercase tracking-widest text-[9px] font-black shadow-sm"
                        >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Request Review
                        </Button>
                    </Link>
                </div>

                {/* Troubleshooting hints */}
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-none bg-secondary/30 border border-border/50">
                        <AlertCircle size={16} className="text-primary mt-0.5 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-wider text-foreground">Why am I seeing this?</p>
                            <p className="text-[10px] text-muted-foreground leading-tight">Automated activity or rapid browsing triggered our safety systems.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-none bg-secondary/30 border border-border/50">
                        <RefreshCw size={16} className="text-accent mt-0.5 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-wider text-foreground">What can I do?</p>
                            <p className="text-[10px] text-muted-foreground leading-tight">Wait 60 seconds and refresh the page. Usually, the block is temporary.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Signature */}
            <div className="mt-12 flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-[1px] w-8 bg-border" />
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground">
                        Shielded by Arcjet
                    </span>
                    <div className="h-[1px] w-8 bg-border" />
                </div>
            </div>
        </div>
    );
}
