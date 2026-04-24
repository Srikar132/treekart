"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Loader2, Eye, EyeOff, TreePine } from "lucide-react";
import { AnimatedButton } from "@/components/shared/animated-button";
import { type ActionState, type SignInFields } from "@/lib/validations";
import { useState } from "react";

type SignInState = ActionState<SignInFields>;

export function SigninForm({ redirectTo }: { redirectTo: string }) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const [state, action, pending] = useActionState(async (prev: SignInState, formData: FormData) => {
        const result = await loginUser(prev, formData);

        if (result.success) {
            router.push(redirectTo);
            router.refresh();
        }

        return result;
    }, {} as SignInState);

    return (
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center border border-primary/20 bg-primary/5 p-4">
                        <TreePine size={28} className="text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground uppercase">
                            Sign In
                        </h1>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest">
                            Welcome back to the grove
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

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-xs font-bold uppercase tracking-widest text-foreground"
                                >
                                    Password
                                </Label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
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

                        {state.errors?._server && (
                            <div className="border border-destructive/50 bg-destructive/5 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-destructive">
                                {state.errors._server}
                            </div>
                        )}

                        <AnimatedButton
                            label={pending ? "Authenticating..." : "Sign In"}
                            disabled={pending}
                            icon={pending ? <Loader2 size={16} className="animate-spin" /> : null}
                            className="w-full h-12 bg-primary text-primary-foreground border-transparent"
                            fillClassName="bg-white"
                            hoverTextClassName="hover:text-primary"
                        />
                    </form>

                    <div className="mt-8 pt-8 border-t border-border">
                        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            New to Treekart?{" "}
                            <Link
                                href={`/auth/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
                                className="text-primary hover:underline transition-colors ml-2 border-b border-primary/30 hover:border-primary"
                            >
                                Create Account
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