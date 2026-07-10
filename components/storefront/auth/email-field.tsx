"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { suggestEmailCorrection } from "@/lib/email-typo";

/**
 * Email input with an advisory typo suggestion.
 *
 * The address is never verified, so a mistyped domain silently swallows every
 * order confirmation. The suggestion is offered, never forced: a user with an
 * unusual domain must always be able to submit what they typed.
 */
export function EmailField({
    value,
    onChange,
    error,
    optional = false,
    helperText,
    autoFocus,
}: {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    optional?: boolean;
    helperText?: string;
    autoFocus?: boolean;
}) {
    const [suggestion, setSuggestion] = useState<string | null>(null);

    return (
        <div className="space-y-2">
            <Label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-widest text-foreground"
            >
                Email{" "}
                {optional && (
                    <span className="font-medium normal-case tracking-normal text-muted-foreground">
                        (optional)
                    </span>
                )}
            </Label>

            <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus={autoFocus}
                placeholder="you@email.com"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    if (suggestion) setSuggestion(null);
                }}
                onBlur={() => setSuggestion(suggestEmailCorrection(value))}
                className={`h-12 rounded-none border-border bg-background px-4 text-sm focus-visible:ring-primary ${
                    error ? "border-destructive" : ""
                }`}
            />

            {helperText && !error && (
                <p className="p-xs leading-relaxed">{helperText}</p>
            )}

            {suggestion && !error && (
                <button
                    type="button"
                    onClick={() => {
                        onChange(suggestion);
                        setSuggestion(null);
                    }}
                    className="text-left text-xs font-semibold text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
                >
                    Did you mean <span className="font-bold">{suggestion}</span>?
                </button>
            )}

            {error && (
                <p className="text-[10px] font-bold uppercase text-destructive">{error}</p>
            )}
        </div>
    );
}
