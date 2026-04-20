"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Leaf, Loader2, Eye, EyeOff, TreePine, CheckCircle2, Phone } from "lucide-react";
import { AnimatedButton } from "@/components/shared/animated-button";

type FormState = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
};

function validateForm(f: FormState): FormErrors {
    const errors: FormErrors = {};
    if (!f.firstName.trim()) errors.firstName = "Required";
    if (!f.lastName.trim()) errors.lastName = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
        errors.email = "Enter a valid email";
    if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\s/g, "")))
        errors.phone = "Enter a valid 10-digit Indian mobile number";
    if (f.password.length < 8)
        errors.password = "Password must be at least 8 characters";
    if (f.password !== f.confirmPassword)
        errors.confirmPassword = "Passwords do not match";
    return errors;
}

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/";

    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const set = (key: keyof FormState) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setForm((f) => ({ ...f, [key]: e.target.value }));
            if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
        };

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setServerError(null);

        const validationErrors = validateForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        const supabase = createClient();

        // 1. Sign Up
        const { error: signUpError } = await supabase.auth.signUp({
            email: form.email.trim(),
            password: form.password,
            options: {
                data: {
                    full_name: `${form.firstName.trim()} ${form.lastName.trim()}`,
                    phone: `+91${form.phone.replace(/\s/g, "")}`,
                },
            },
        });

        if (signUpError) {
            setServerError(
                signUpError.message.includes("already registered")
                    ? "An account with this email already exists. Sign in instead."
                    : signUpError.message
            );
            setLoading(false);
            return;
        }

        // 2. Log in immediately (Assumes "Confirm email" is OFF in Supabase dashboard)
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: form.email.trim(),
            password: form.password,
        });

        if (signInError) {
            // If sign in fails but signup succeeded, redirect to signin page with a message
            router.push(`/auth/signin?message=Account created. Please sign in.&redirectTo=${encodeURIComponent(redirectTo)}`);
            return;
        }

        router.push(redirectTo);
        router.refresh();
    }

    return (
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center border border-primary/20 bg-primary/5 p-4">
                        <TreePine size={28} className="text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground uppercase">
                            Create Account
                        </h1>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest">
                            Join the TreeKart community
                        </p>
                    </div>
                </div>

                {/* Form Container */}
                <div className="border border-border bg-card p-8 md:p-10">
                    <form onSubmit={handleRegister} className="space-y-6">
                        {/* Name row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
                                    First Name
                                </Label>
                                <Input
                                    placeholder="RAVI"
                                    autoComplete="given-name"
                                    value={form.firstName}
                                    onChange={set("firstName")}
                                    className={`h-12 border-border bg-background px-4 text-sm focus-visible:ring-primary rounded-none ${errors.firstName ? "border-destructive" : ""}`}
                                />
                                {errors.firstName && (
                                    <p className="text-[10px] font-bold text-destructive uppercase">{errors.firstName}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
                                    Last Name
                                </Label>
                                <Input
                                    placeholder="KUMAR"
                                    autoComplete="family-name"
                                    value={form.lastName}
                                    onChange={set("lastName")}
                                    className={`h-12 border-border bg-background px-4 text-sm focus-visible:ring-primary rounded-none ${errors.lastName ? "border-destructive" : ""}`}
                                />
                                {errors.lastName && (
                                    <p className="text-[10px] font-bold text-destructive uppercase">{errors.lastName}</p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-foreground">Email</Label>
                            <Input
                                type="email"
                                placeholder="YOU@EXAMPLE.COM"
                                autoComplete="email"
                                value={form.email}
                                onChange={set("email")}
                                className={`h-12 border-border bg-background px-4 text-sm focus-visible:ring-primary rounded-none ${errors.email ? "border-destructive" : ""}`}
                            />
                            {errors.email && (
                                <p className="text-[10px] font-bold text-destructive uppercase">{errors.email}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
                                Phone Number
                            </Label>
                            <div className="flex gap-2">
                                <Select defaultValue="+91" disabled>
                                    <SelectTrigger className="w-24 h-12 border-border bg-background rounded-none">
                                        <SelectValue>
                                            <span className="text-xs font-bold">🇮🇳 +91</span>
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none">
                                        <SelectItem value="+91">🇮🇳 +91</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="tel"
                                    placeholder="98765 43210"
                                    autoComplete="tel"
                                    value={form.phone}
                                    onChange={set("phone")}
                                    maxLength={10}
                                    className={`h-12 flex-1 border-border bg-background px-4 text-sm focus-visible:ring-primary rounded-none ${errors.phone ? "border-destructive" : ""}`}
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-[10px] font-bold text-destructive uppercase">{errors.phone}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-foreground">Password</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="MIN. 8 CHARACTERS"
                                    autoComplete="new-password"
                                    value={form.password}
                                    onChange={set("password")}
                                    className={`h-12 border-border bg-background pr-12 text-sm focus-visible:ring-primary rounded-none ${errors.password ? "border-destructive" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-[10px] font-bold text-destructive uppercase">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Input
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="REPEAT PASSWORD"
                                    autoComplete="new-password"
                                    value={form.confirmPassword}
                                    onChange={set("confirmPassword")}
                                    className={`h-12 border-border bg-background pr-12 text-sm focus-visible:ring-primary rounded-none ${errors.confirmPassword ? "border-destructive" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-[10px] font-bold text-destructive uppercase">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {serverError && (
                            <div className="border border-destructive/50 bg-destructive/5 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-destructive">
                                {serverError}
                            </div>
                        )}

                        <AnimatedButton
                            label={loading ? "Creating Account..." : "Create Account"}
                            disabled={loading}
                            icon={loading ? <Loader2 size={16} className="animate-spin" /> : null}
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
                                className="text-primary hover:text-grove-light transition-colors ml-2 border-b border-primary/30 hover:border-primary"
                            >
                                Sign In Instead
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Trust line */}
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
