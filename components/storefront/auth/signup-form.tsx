"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf, Loader2, Eye, EyeOff, TreePine, CheckCircle2 } from "lucide-react";
import { AnimatedButton } from "@/components/shared/animated-button";
import { type ActionState, type SignUpFields } from "@/lib/validations";

type SignUpState = ActionState<SignUpFields> & { success?: boolean; hasSession?: boolean };

export function SignupForm({ redirectTo }: { redirectTo: string }) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [termsError, setTermsError] = useState(false);

    const [state, action, pending] = useActionState(registerUser, {});

    useEffect(() => {
        const s = state as SignUpState;
        if (s.success) {
            if (s.hasSession) {
                // Auto-confirmed — session ready, go to destination
                router.push(redirectTo);
                router.refresh();
            } else {
                // Email confirmation required — show verify screen
                setIsSuccess(true);
            }
        }
    }, [state, router, redirectTo]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (!agreedToTerms) {
            e.preventDefault();
            setTermsError(true);
            return;
        }
        setTermsError(false);
    };

    if (isSuccess) {
        return (
            <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-12 text-center animate-in fade-in zoom-in duration-500">
                    <div className="inline-flex items-center justify-center border border-primary/20 bg-primary/5 p-6 rounded-full">
                        <CheckCircle2 size={48} className="text-primary" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Verify Your Email</h2>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed uppercase tracking-widest">
                            We've sent a verification link to <br />
                            <span className="font-black text-slate-900">{state.values?.email}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                            Please check your inbox to activate your account.
                        </p>
                    </div>
                    <div className="pt-8">
                        <Link href="/auth/signin" className="text-xs font-black uppercase tracking-widest text-primary hover:underline underline-offset-4 decoration-primary/30">
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center border border-primary/20 bg-primary/5 p-4">
                        <TreePine size={28} className="text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground uppercase">
                            Create Account
                        </h1>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest">
                            Join the heritage preservation
                        </p>
                    </div>
                </div>

                <div className="border border-border bg-card p-8 md:p-10">
                    <form action={action} onSubmit={handleSubmit} className="space-y-6">
                        <input type="hidden" name="redirectTo" value={redirectTo} />
                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-foreground">
                                Full Name
                            </Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                placeholder="Enter your name"
                                key={state.values?.fullName}
                                defaultValue={state.values?.fullName ?? ""}
                                className={`h-12 border-border bg-background px-4 text-sm focus-visible:ring-primary rounded-none ${state.errors?.fullName ? "border-destructive" : ""}`}
                            />
                            {state.errors?.fullName && (
                                <p className="text-[10px] font-bold text-destructive uppercase">
                                    {state.errors.fullName}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-foreground">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                key={state.values?.email}
                                defaultValue={state.values?.email ?? ""}
                                className={`h-12 border-border bg-background px-4 text-sm focus-visible:ring-primary rounded-none ${state.errors?.email ? "border-destructive" : ""}`}
                            />
                            {state.errors?.email && (
                                <p className="text-[10px] font-bold text-destructive uppercase">
                                    {state.errors.email}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-foreground">
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder="Enter your phone number"
                                key={state.values?.phone}
                                defaultValue={state.values?.phone ?? ""}
                                className={`h-12 border-border bg-background px-4 text-sm focus-visible:ring-primary rounded-none ${state.errors?.phone ? "border-destructive" : ""}`}
                            />
                            {state.errors?.phone && (
                                <p className="text-[10px] font-bold text-destructive uppercase">
                                    {state.errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-foreground">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`h-12 border-border bg-background pr-12 text-sm focus-visible:ring-primary rounded-none ${state.errors?.password ? "border-destructive" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {state.errors?.password && (
                                <p className="text-[10px] font-bold text-destructive uppercase">
                                    {state.errors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest text-foreground">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={`h-12 border-border bg-background px-4 text-sm focus-visible:ring-primary rounded-none ${state.errors?.confirmPassword ? "border-destructive" : ""}`}
                            />
                            {state.errors?.confirmPassword && (
                                <p className="text-[10px] font-bold text-destructive uppercase">
                                    {state.errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {state.errors?._server && (
                            <div className="border border-destructive/50 bg-destructive/5 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-destructive">
                                {state.errors._server}
                            </div>
                        )}

                        {/* Terms & Privacy Checkbox */}
                        <div className="space-y-2">
                            <div className={`flex items-start gap-3 p-4 border border-l-4 ${termsError ? "border-destructive border-l-destructive bg-destructive/5" : "border-border border-l-primary bg-primary/5"}`}>
                                <Checkbox
                                    id="terms"
                                    checked={agreedToTerms}
                                    onCheckedChange={(checked) => {
                                        setAgreedToTerms(!!checked);
                                        if (checked) setTermsError(false);
                                    }}
                                    className="mt-0.5 size-5"
                                />
                                <label
                                    htmlFor="terms"
                                    className="text-[11px] font-semibold text-foreground leading-relaxed cursor-pointer select-none"
                                >
                                    I have read and agree to the{" "}
                                    <Link href="/terms" className="text-primary font-bold underline underline-offset-2 decoration-primary/40 hover:decoration-primary">
                                        Terms & Conditions
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="text-primary font-bold underline underline-offset-2 decoration-primary/40 hover:decoration-primary">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                            {termsError && (
                                <p className="text-[10px] font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                                    Please accept the Terms & Conditions and Privacy Policy to continue
                                </p>
                            )}
                        </div>

                        <AnimatedButton
                            label={pending ? "Creating Account..." : "Sign Up"}
                            disabled={pending}
                            icon={pending ? <Loader2 size={16} className="animate-spin" /> : null}
                            className="w-full h-12 bg-primary text-primary-foreground border-transparent"
                            fillClassName="bg-white"
                            hoverTextClassName="hover:text-primary"
                        />
                    </form>

                    <div className="mt-8 pt-8 border-t border-border">
                        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                href={`/auth/signin?redirectTo=${encodeURIComponent(redirectTo)}`}
                                className="text-primary hover:underline transition-colors ml-2 border-b border-primary/30 hover:border-primary"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <Leaf size={14} className="text-primary" />
                        Rooted in Trust • Grown for You
                    </p>
                </div>
            </div>
        </div>
    );
}