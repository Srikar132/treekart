"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2 } from "lucide-react";
import { saveContactEmail } from "@/actions/user.actions";
import { AnimatedButton } from "@/components/shared/animated-button";
import { ResponsiveDialog } from "@/components/storefront/auth/responsive-dialog";
import { EmailField } from "@/components/storefront/auth/email-field";

/**
 * Asked for at checkout when the user skipped email at sign-up.
 *
 * Dismissible: declining blocks only the order, never the browsing session, and
 * the cart + address stay intact. The real enforcement lives in the order
 * actions — this dialog just gives the user a way to satisfy it.
 */
export function EmailRequiredDialog({
    open,
    onOpenChange,
    onSaved,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved: () => void;
}) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
            const res = await saveContactEmail({ email: email.trim() });
            if (!res.success) {
                setError(res.error);
                return;
            }
            // Refresh so the server sees the new profile email on the retry.
            router.refresh();
            onOpenChange(false);
            onSaved();
        });
    };

    return (
        <ResponsiveDialog
            open={open}
            onOpenChange={onOpenChange}
            title="One Last Thing"
            description="We need an email to send your order confirmation."
            icon={<Mail size={24} className="text-primary" />}
        >
            <form onSubmit={submit} className="space-y-6">
                <EmailField
                    value={email}
                    onChange={setEmail}
                    error={error ?? undefined}
                    autoFocus
                    helperText="Your order confirmation, invoice and delivery updates go here."
                />

                <AnimatedButton
                    label={pending ? "Saving..." : "Save & Continue"}
                    disabled={pending || !email.trim()}
                    icon={pending ? <Loader2 size={16} className="animate-spin" /> : null}
                    className="h-12 w-full border-transparent bg-primary text-primary-foreground"
                    fillClassName="bg-mango"
                    hoverTextClassName="hover:text-foreground"
                />

                <p className="p-xs text-center">
                    Your cart is saved. You can add this later and come back.
                </p>
            </form>
        </ResponsiveDialog>
    );
}
