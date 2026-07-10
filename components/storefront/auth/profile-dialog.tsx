"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeProfile } from "@/actions/user.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserCheck } from "lucide-react";
import { AnimatedButton } from "@/components/shared/animated-button";
import { ResponsiveDialog } from "@/components/storefront/auth/responsive-dialog";
import { EmailField } from "@/components/storefront/auth/email-field";

/**
 * Shown once, after a new user's first OTP verification.
 *
 * Name is required. Email is optional and explained — it is asked for again, and
 * required, at the point of ordering. Not dismissible: the proxy would only send
 * the user straight back here.
 */
export function ProfileDialog({
    open,
    redirectTo,
}: {
    open: boolean;
    redirectTo: string;
}) {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [nameError, setNameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setNameError(null);
        setEmailError(null);
        setServerError(null);

        startTransition(async () => {
            const res = await completeProfile({
                fullName: fullName.trim(),
                email: email.trim() || undefined,
            });

            if (res.success) {
                router.push(redirectTo);
                router.refresh();
                return;
            }
            // The action returns a single message; surface it against the likely field.
            if (/name/i.test(res.error)) setNameError(res.error);
            else if (/email/i.test(res.error)) setEmailError(res.error);
            else setServerError(res.error);
        });
    };

    return (
        <ResponsiveDialog
            open={open}
            dismissible={false}
            title="Almost There"
            description="Tell us your name so we can personalise your orders."
            icon={<UserCheck size={24} className="text-primary" />}
        >
            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-2">
                    <Label
                        htmlFor="fullName"
                        className="text-xs font-bold uppercase tracking-widest text-foreground"
                    >
                        Full Name
                    </Label>
                    <Input
                        id="fullName"
                        name="fullName"
                        autoFocus
                        autoComplete="name"
                        placeholder="Enter your name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`h-12 rounded-none border-border bg-background px-4 text-sm focus-visible:ring-primary ${
                            nameError ? "border-destructive" : ""
                        }`}
                    />
                    {nameError && (
                        <p className="text-[10px] font-bold uppercase text-destructive">{nameError}</p>
                    )}
                </div>

                <EmailField
                    value={email}
                    onChange={setEmail}
                    error={emailError ?? undefined}
                    optional
                    helperText="We'll send order confirmations and delivery updates here. You can add it later."
                />

                {serverError && (
                    <div className="border border-destructive/50 bg-destructive/5 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-destructive">
                        {serverError}
                    </div>
                )}

                <AnimatedButton
                    label={pending ? "Saving..." : "Continue"}
                    disabled={pending}
                    icon={pending ? <Loader2 size={16} className="animate-spin" /> : null}
                    className="h-12 w-full border-transparent bg-primary text-primary-foreground"
                    fillClassName="bg-mango"
                    hoverTextClassName="hover:text-foreground"
                />
            </form>
        </ResponsiveDialog>
    );
}
