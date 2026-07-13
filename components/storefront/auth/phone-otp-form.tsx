"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendOtp, verifyOtp } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf, Loader2, TreePine, Smartphone, ShieldCheck, ArrowLeft } from "lucide-react";
import { AnimatedButton } from "@/components/shared/animated-button";
import { Turnstile, type TurnstileHandle } from "@/components/storefront/auth/turnstile";
import { ProfileDialog } from "@/components/storefront/auth/profile-dialog";
import { formatE164ForDisplay } from "@/lib/phone";

const RESEND_SECONDS = 30;
// The pending number survives a refresh of the OTP step; without this a reload
// strands the user on a form with no number to verify against.
const PENDING_PHONE_KEY = "treekart-pending-phone";

export function PhoneOtpForm({
    redirectTo,
    startWithProfileDialog = false,
}: {
    redirectTo: string;
    /** The user is already signed in but has no full_name — go straight to onboarding. */
    startWithProfileDialog?: boolean;
}) {
    const router = useRouter();
    const turnstileRef = useRef<TurnstileHandle>(null);

    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [phoneInput, setPhoneInput] = useState("");
    const [pendingPhone, setPendingPhone] = useState(""); // E.164
    const [otp, setOtp] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [termsError, setTermsError] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [showProfile, setShowProfile] = useState(startWithProfileDialog);
    const [pending, startTransition] = useTransition();

    // Restore an in-flight verification after a reload.
    useEffect(() => {
        const stored = sessionStorage.getItem(PENDING_PHONE_KEY);
        if (stored) {
            setPendingPhone(stored);
            setStep("otp");
        }
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    /** Turnstile tokens are single-use — mint a fresh one for every send. */
    const consumeToken = () => {
        const token = captchaToken;
        setCaptchaToken("");
        turnstileRef.current?.reset();
        return token;
    };

    const doSend = (rawPhone: string, token: string) => {
        // Turnstile is single-use and re-solves asynchronously after a reset. If a
        // send fires before the fresh token lands, the server-side captcha check
        // fails with a confusing error — guard here and ask the user to wait.
        if (!token) {
            setError("Verifying you're human — one moment, then try again.");
            return;
        }
        startTransition(async () => {
            setError(null);
            const fd = new FormData();
            fd.set("phone", rawPhone);
            fd.set("captchaToken", token);

            const res = await sendOtp({}, fd);
            if (res.success && res.phone) {
                setPendingPhone(res.phone);
                sessionStorage.setItem(PENDING_PHONE_KEY, res.phone);
                setStep("otp");
                setCooldown(RESEND_SECONDS);
            } else {
                setError(res.error ?? "Could not send the code.");
            }
        });
    };

    const handleSendSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreedToTerms) {
            setTermsError(true);
            return;
        }
        setTermsError(false);
        doSend(phoneInput, consumeToken());
    };

    const handleResend = () => {
        if (cooldown > 0 || pending) return;
        doSend(pendingPhone, consumeToken());
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            setError(null);
            const fd = new FormData();
            fd.set("phone", pendingPhone);
            fd.set("otp", otp);

            const res = await verifyOtp({}, fd);
            if (!res.success) {
                setError(res.error ?? "That code is incorrect.");
                return;
            }

            sessionStorage.removeItem(PENDING_PHONE_KEY);

            if (res.needsProfile) {
                setShowProfile(true);
                return;
            }
            router.push(redirectTo);
            router.refresh();
        });
    };

    const backToPhone = () => {
        sessionStorage.removeItem(PENDING_PHONE_KEY);
        setStep("phone");
        setOtp("");
        setError(null);
        turnstileRef.current?.reset();
        setCaptchaToken("");
    };

    return (
        <>
            <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-10">
                    {/* Heading */}
                    <div className="space-y-4 text-center">
                        <div className="inline-flex items-center justify-center border border-primary/20 bg-primary/5 p-4">
                            <TreePine size={28} className="text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold uppercase tracking-tight text-foreground">
                                {step === "phone" ? "Sign In" : "Verify"}
                            </h1>
                            <p className="text-sm uppercase tracking-widest text-muted-foreground">
                                {step === "phone" ? (
                                    "Enter your mobile to continue"
                                ) : (
                                    <>
                                        Code sent to{" "}
                                        <span className="font-bold text-foreground">
                                            {formatE164ForDisplay(pendingPhone)}
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="border border-border bg-card p-card">
                        {step === "phone" ? (
                            <form onSubmit={handleSendSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="phone"
                                        className="text-xs font-bold uppercase tracking-widest text-foreground"
                                    >
                                        Mobile Number
                                    </Label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                                            +91
                                        </span>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={10}
                                            autoComplete="tel-national"
                                            placeholder="9876543210"
                                            value={phoneInput}
                                            onChange={(e) =>
                                                setPhoneInput(e.target.value.replace(/\D/g, ""))
                                            }
                                            className={`h-12 rounded-none border-border bg-background pl-14 text-sm focus-visible:ring-primary ${
                                                error ? "border-destructive" : ""
                                            }`}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="border border-destructive/50 bg-destructive/5 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-destructive">
                                        {error}
                                    </div>
                                )}

                                <div
                                    className={`flex items-start gap-3 border border-l-4 p-4 ${
                                        termsError
                                            ? "border-destructive border-l-destructive bg-destructive/5"
                                            : "border-border border-l-primary bg-primary/5"
                                    }`}
                                >
                                    <Checkbox
                                        id="terms"
                                        checked={agreedToTerms}
                                        onCheckedChange={(c) => {
                                            setAgreedToTerms(!!c);
                                            if (c) setTermsError(false);
                                        }}
                                        className="mt-0.5 size-5"
                                    />
                                    <label
                                        htmlFor="terms"
                                        className="cursor-pointer select-none text-[11px] font-semibold leading-relaxed text-foreground"
                                    >
                                        I agree to the{" "}
                                        <Link href="/terms" className="font-bold text-primary underline underline-offset-2">
                                            Terms &amp; Conditions
                                        </Link>{" "}
                                        and{" "}
                                        <Link href="/privacy" className="font-bold text-primary underline underline-offset-2">
                                            Privacy Policy
                                        </Link>
                                    </label>
                                </div>
                                {termsError && (
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-destructive">
                                        Please accept the Terms &amp; Privacy Policy to continue
                                    </p>
                                )}

                                <AnimatedButton
                                    label={pending ? "Sending Code..." : "Send OTP"}
                                    disabled={pending}
                                    icon={
                                        pending ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Smartphone size={16} />
                                        )
                                    }
                                    className="h-12 w-full border-transparent bg-primary text-primary-foreground"
                                    fillClassName="bg-mango"
                                    hoverTextClassName="hover:text-foreground"
                                />
                            </form>
                        ) : (
                            <form onSubmit={handleVerify} className="space-y-6">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="otp"
                                        className="text-xs font-bold uppercase tracking-widest text-foreground"
                                    >
                                        6-Digit Code
                                    </Label>
                                    <Input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        autoFocus
                                        autoComplete="one-time-code"
                                        placeholder="••••••"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                        className={`h-12 rounded-none border-border bg-background px-4 text-center text-lg tracking-[0.5em] focus-visible:ring-primary ${
                                            error ? "border-destructive" : ""
                                        }`}
                                    />
                                </div>

                                {error && (
                                    <div className="border border-destructive/50 bg-destructive/5 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-destructive">
                                        {error}
                                    </div>
                                )}

                                <AnimatedButton
                                    label={pending ? "Verifying..." : "Verify & Continue"}
                                    disabled={pending || otp.length !== 6}
                                    icon={
                                        pending ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <ShieldCheck size={16} />
                                        )
                                    }
                                    className="h-12 w-full border-transparent bg-primary text-primary-foreground"
                                    fillClassName="bg-mango"
                                    hoverTextClassName="hover:text-foreground"
                                />

                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <button
                                        type="button"
                                        onClick={backToPhone}
                                        className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
                                    >
                                        <ArrowLeft size={12} />
                                        Change number
                                    </button>
                                    <button
                                        type="button"
                                        disabled={cooldown > 0 || pending}
                                        onClick={handleResend}
                                        className="text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary disabled:no-underline disabled:text-muted-foreground"
                                    >
                                        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                                    </button>
                                </div>

                            </form>
                        )}

                        {/* One widget for the whole flow: it must stay mounted across both
                            steps so a resend can mint a fresh single-use token. */}
                        <div className={step === "phone" ? "mt-6" : "sr-only"}>
                            <Turnstile
                                ref={turnstileRef}
                                onVerify={setCaptchaToken}
                                onExpire={() => setCaptchaToken("")}
                            />
                        </div>
                    </div>

                    <p className="flex items-center justify-center gap-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        <Leaf size={14} className="text-primary" />
                        Rooted in Trust • Grown for You
                    </p>
                </div>
            </div>

            <ProfileDialog open={showProfile} redirectTo={redirectTo} />
        </>
    );
}
