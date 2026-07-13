"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, type Ref } from "react";

// Cloudflare Turnstile — no npm dependency, just the official script.
//
// Guards the OTP-send step. Every SMS costs money, and per-IP rate limiting alone
// does not stop distributed bots from draining the SMS balance.
//
// Turnstile tokens are SINGLE USE. The parent must call reset() before each send
// (including resends) or the second request silently fails validation.

declare global {
    interface Window {
        turnstile?: {
            render: (el: HTMLElement, opts: Record<string, unknown>) => string;
            reset: (id?: string) => void;
            remove: (id?: string) => void;
        };
        onTurnstileLoad?: () => void;
    }
}

const SCRIPT_SRC =
    "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit";

export type TurnstileHandle = { reset: () => void };

export function Turnstile({
    onVerify,
    onExpire,
    ref,
}: {
    onVerify: (token: string) => void;
    onExpire?: () => void;
    ref?: Ref<TurnstileHandle>;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    // Cloudflare's real site key is domain-locked to prod; it won't render on
    // localhost. Use the universal Cloudflare test key outside production so
    // dev keeps working without touching the prod key's allowed domains.
    const siteKey =
        process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
            : process.env.NEXT_PUBLIC_TURNSTILE_TEST_SITE_KEY ?? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    // Keep the latest callbacks without re-rendering the widget. Assigned in an
    // effect, not during render — a render can be discarded, and mutating a ref
    // then leaves the widget calling a callback that never committed.
    const verifyRef = useRef(onVerify);
    const expireRef = useRef(onExpire);

    useEffect(() => {
        verifyRef.current = onVerify;
        expireRef.current = onExpire;
    }, [onVerify, onExpire]);

    const reset = useCallback(() => {
        if (widgetId.current && window.turnstile) {
            window.turnstile.reset(widgetId.current);
        }
    }, []);

    useImperativeHandle(ref, () => ({ reset }), [reset]);

    useEffect(() => {
        if (!siteKey || !containerRef.current) return;

        const render = () => {
            if (!window.turnstile || !containerRef.current || widgetId.current) return;
            widgetId.current = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                callback: (token: string) => verifyRef.current(token),
                "expired-callback": () => expireRef.current?.(),
                "error-callback": () => expireRef.current?.(),
            });
        };

        if (window.turnstile) {
            render();
        } else {
            window.onTurnstileLoad = render;
            if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
                const script = document.createElement("script");
                script.src = SCRIPT_SRC;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            }
        }

        const id = widgetId.current;
        return () => {
            if (id && window.turnstile) window.turnstile.remove(id);
            widgetId.current = null;
        };
    }, [siteKey]);

    // Without a site key (local dev) the widget is absent and the server-side
    // CAPTCHA check is expected to be disabled too.
    if (!siteKey) return null;

    return <div ref={containerRef} className="flex justify-center" />;
}
