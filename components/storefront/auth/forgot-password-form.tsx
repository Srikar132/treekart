"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Loader2, TreePine, CheckCircle2 } from "lucide-react";
import { AnimatedButton } from "@/components/shared/animated-button";
import { type ActionState, type ForgotPasswordFields } from "@/lib/validations";

type ForgotPasswordState = ActionState<ForgotPasswordFields>;

export function ForgotPasswordForm() {
    const [state, action, pending] = useActionState(async (prev: ForgotPasswordState, formData: FormData) => {
        return await requestPasswordReset(prev, formData);
    }, {} as ForgotPasswordState);

    if (state.success) {
        return (
            <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 text-center animate-in fade-in zoom-in duration-500">
                    <div className="inline-flex items-center justify-center border border-primary/20 bg-primary/5 p-4">
                        <CheckCircle2 size={32} className="text-primary" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground uppercase">
                            Check Your Email
                        </h1>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest leading-relaxed">
                            We&apos;ve sent a password reset link to <span className="text-primary font-bold">{state.values?.email}</span>. Please check your inbox and spam folder.
                        </p>
                    </div>
                    <div className="pt-8">
                        <Link
                            href="/auth/signin"
                            className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:underline underline-offset-8 transition-all"
                        >
                            Return to Sign In
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
                            Reset Password
                        </h1>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest">
                            Enter your email to receive a recovery link
                        </p>
                    </div>
                </div>

                <div className="border border-border bg-card p-8 md:p-10">
                    <form action={action} className="space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="text-xs font-bold uppercase tracking-widest text-foreground"
                            >
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="YOUR@EMAIL.COM"
                                autoComplete="email"
                                required
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

                        {state.errors?._server && (
                            <div className="border border-destructive/50 bg-destructive/5 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-destructive">
                                {state.errors._server}
                            </div>
                        )}

                        <AnimatedButton
                            label={pending ? "Sending Link..." : "Send Reset Link"}
                            disabled={pending}
                            icon={pending ? <Loader2 size={16} className="animate-spin" /> : null}
                            className="w-full h-12 bg-primary text-primary-foreground border-transparent"
                            fillClassName="bg-white"
                            hoverTextClassName="hover:text-primary"
                        />
                    </form>

                    <div className="mt-8 pt-8 border-t border-border">
                        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            Remembered your password?{" "}
                            <Link
                                href="/auth/signin"
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
