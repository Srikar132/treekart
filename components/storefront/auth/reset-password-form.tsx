"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { updatePassword } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Loader2, TreePine, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { AnimatedButton } from "@/components/shared/animated-button";
import { type ActionState, type ResetPasswordFields } from "@/lib/validations";

type ResetPasswordState = ActionState<ResetPasswordFields>;

export function ResetPasswordForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [state, action, pending] = useActionState(async (prev: ResetPasswordState, formData: FormData) => {
        return await updatePassword(prev, formData);
    }, {} as ResetPasswordState);

    if (state.success) {
        return (
            <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 text-center animate-in fade-in zoom-in duration-500">
                    <div className="inline-flex items-center justify-center border border-primary/20 bg-primary/5 p-4">
                        <CheckCircle2 size={32} className="text-primary" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground uppercase">
                            Password Reset
                        </h1>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest leading-relaxed">
                            Your password has been successfully updated. You can now sign in with your new credentials.
                        </p>
                    </div>
                    <div className="pt-8">
                        <Link
                            href="/auth/signin"
                            className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:underline underline-offset-8 transition-all"
                        >
                            Go to Sign In
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
                            New Password
                        </h1>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest">
                            Secure your account with a fresh password
                        </p>
                    </div>
                </div>

                <div className="border border-border bg-card p-8 md:p-10">
                    <form action={action} className="space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="text-xs font-bold uppercase tracking-widest text-foreground"
                            >
                                New Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
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

                        <div className="space-y-2">
                            <Label
                                htmlFor="confirmPassword"
                                className="text-xs font-bold uppercase tracking-widest text-foreground"
                            >
                                Confirm New Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
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

                        <AnimatedButton
                            label={pending ? "Updating..." : "Update Password"}
                            disabled={pending}
                            icon={pending ? <Loader2 size={16} className="animate-spin" /> : null}
                            className="w-full h-12 bg-primary text-primary-foreground border-transparent"
                            fillClassName="bg-white"
                            hoverTextClassName="hover:text-primary"
                        />
                    </form>
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
