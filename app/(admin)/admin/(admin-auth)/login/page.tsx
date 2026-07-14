"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Smartphone,
  ShieldCheck,
  Loader2,
  KeyRound,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { toE164, formatE164ForDisplay } from "@/lib/phone";
import { Turnstile, type TurnstileHandle } from "@/components/storefront/auth/turnstile";
import { generateRecoveryCodes, redeemRecoveryCode } from "@/actions/admin-mfa.actions";

type Step = "phone" | "otp" | "mfa-enroll" | "mfa-challenge" | "recovery" | "codes";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const turnstileRef = useRef<TurnstileHandle>(null);

  const [step, setStep] = useState<Step>("phone");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [recoveryInput, setRecoveryInput] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // ── Step 1: send OTP ──────────────────────────────────────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const e164 = toE164(phone);
    if (!e164) return toast.error("Enter a valid 10-digit mobile number.");

    // Turnstile re-solves asynchronously; if the widget hasn't produced a
    // token yet the server-side captcha check fails and no code is sent.
    if (!captchaToken) return toast.error("Verifying you're human — one moment, then try again.");

    // Tokens are single-use — mint a fresh one for every send, or a resend
    // silently fails the server-side captcha check.
    const token = captchaToken;
    setCaptchaToken("");
    turnstileRef.current?.reset();

    setLoading(true);
    try {
      // shouldCreateUser:false — admins must pre-exist. Supabase returns
      // "user_not_found" for unknown numbers; that one is swallowed so this
      // endpoint can't be used to enumerate which numbers are admins. Any
      // other error (captcha rejected, rate-limited, SMS provider down) means
      // no code was actually sent — surface it and stay on this step, or the
      // admin is left typing into a code entry field with nothing to verify.
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164,
        options: { channel: "sms", shouldCreateUser: false, captchaToken: token },
      });

      if (error && error.code !== "user_not_found") {
        console.error("admin sendOtp:", error.message);
        toast.error(error.message || "Could not send the code. Please try again.");
        return;
      }
      if (error) console.error("admin sendOtp:", error.message);

      setStep("otp");
      toast.success("If that number is registered, a code has been sent.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: verify OTP → role check → route to second factor ──────
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const e164 = toE164(phone);
    if (!e164) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: e164,
        token: otp,
        type: "sms",
      });
      if (error) throw error;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user!.id)
        .single();

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Access denied: administrative privileges required.");
      }

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
        await loadExistingFactor();
      } else {
        await startEnroll();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  async function loadExistingFactor() {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totp = factors?.totp?.[0];
    if (!totp) return startEnroll();
    setFactorId(totp.id);
    setStep("mfa-challenge");
  }

  async function startEnroll() {
    // Clear any half-finished enrolment first, or enroll() collides with it.
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const stale = factors?.all?.find(
      (f) => f.factor_type === "totp" && f.status === "unverified"
    );
    if (stale) await supabase.auth.mfa.unenroll({ factorId: stale.id });

    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (error) return toast.error(error.message);

    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setStep("mfa-enroll");
  }

  // ── Verify the TOTP code (both enrol-confirm and challenge) ───────
  async function handleVerifyMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;

    const wasEnrolling = step === "mfa-enroll";
    setLoading(true);
    try {
      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
      if (cErr) throw cErr;

      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: mfaCode,
      });
      if (vErr) throw vErr;

      // Fresh enrolment → issue recovery codes once, before letting them in.
      if (wasEnrolling) {
        const res = await generateRecoveryCodes();
        if (res.success) {
          setRecoveryCodes(res.codes);
          setStep("codes");
          return;
        }
        toast.error(res.error);
      }

      toast.success("Welcome back, Administrator.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Incorrect authenticator code.");
    } finally {
      setLoading(false);
    }
  }

  // ── Recovery: redeem a code → factor reset → re-enrol ─────────────
  // A code does NOT grant AAL2. It authorizes removing the lost factor; the admin
  // must then enrol a new one and verify it.
  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await redeemRecoveryCode({ code: recoveryInput });
      if (!res.success) throw new Error(res.error);
      toast.success("Recovery code accepted. Set up your authenticator again.");
      setRecoveryInput("");
      setMfaCode("");
      await startEnroll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "That recovery code is not valid.");
    } finally {
      setLoading(false);
    }
  }

  function copyCodes() {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Shared style tokens (admin light theme — brand colours via tokens) ──
  const fieldIcon =
    "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground";
  const inputBase =
    "h-12 rounded-lg border-border bg-background pl-11 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25";
  const btnPrimary =
    "h-12 w-full rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-[0.15em] hover:bg-primary/90 disabled:opacity-60";

  return (
    <main className="admin-theme flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-[420px] space-y-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Brand */}
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <TrendingUp className="text-primary" size={30} />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">
              Admin<span className="text-primary">Portal</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              TreeKart Control Terminal
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <StepHeader title="Sign In" subtitle="Enter your registered admin mobile" />
              <Field label="Admin Mobile">
                <div className="relative">
                  <Smartphone className={fieldIcon} size={18} />
                  <Input
                    type="tel" inputMode="numeric" maxLength={10} required
                    value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210" className={inputBase}
                  />
                </div>
              </Field>
              <div className="flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  onVerify={setCaptchaToken}
                  onExpire={() => setCaptchaToken("")}
                />
              </div>
              <Button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Send OTP"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <StepHeader
                title="Verify"
                subtitle={`Code sent to ${formatE164ForDisplay(toE164(phone) ?? phone)}`}
              />
              <Field label="6-Digit Code">
                <div className="relative">
                  <KeyRound className={fieldIcon} size={18} />
                  <Input
                    type="text" inputMode="numeric" maxLength={6} autoFocus required
                    autoComplete="one-time-code"
                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••" className={`${inputBase} text-center tracking-[0.5em]`}
                  />
                </div>
              </Field>
              <Button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify"}
              </Button>
              <BackLink onClick={() => setStep("phone")}>Change number</BackLink>
            </form>
          )}

          {step === "mfa-enroll" && (
            <form onSubmit={handleVerifyMfa} className="space-y-6">
              <StepHeader
                title="Set Up Authenticator"
                subtitle="Scan the code with your authenticator app, then enter the 6-digit code"
              />
              {qrCode && (
                <div className="flex justify-center rounded-lg border border-border bg-white p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="Authenticator QR code" width={176} height={176} />
                </div>
              )}
              <Field label="Authenticator Code">
                <MfaCodeInput value={mfaCode} onChange={setMfaCode} icon={fieldIcon} inputClass={inputBase} />
              </Field>
              <Button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Enable & Enter"}
              </Button>
            </form>
          )}

          {step === "mfa-challenge" && (
            <form onSubmit={handleVerifyMfa} className="space-y-6">
              <StepHeader
                title="Two-Factor"
                subtitle="Enter the current code from your authenticator app"
              />
              <Field label="Authenticator Code">
                <MfaCodeInput value={mfaCode} onChange={setMfaCode} icon={fieldIcon} inputClass={inputBase} />
              </Field>
              <Button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify & Enter"}
              </Button>
              <BackLink onClick={() => setStep("recovery")}>Lost your authenticator?</BackLink>
            </form>
          )}

          {step === "recovery" && (
            <form onSubmit={handleRedeem} className="space-y-6">
              <StepHeader title="Recovery" subtitle="Enter one of your saved recovery codes" />
              <Field label="Recovery Code">
                <div className="relative">
                  <ShieldCheck className={fieldIcon} size={18} />
                  <Input
                    autoFocus required value={recoveryInput}
                    onChange={(e) => setRecoveryInput(e.target.value)}
                    placeholder="XXXXX-XXXXX"
                    className={`${inputBase} text-center uppercase tracking-widest`}
                  />
                </div>
              </Field>
              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                This removes your old authenticator. You will set up a new one next.
              </p>
              <Button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Use Recovery Code"}
              </Button>
              <BackLink onClick={() => setStep("mfa-challenge")}>Back to authenticator</BackLink>
            </form>
          )}

          {step === "codes" && (
            <div className="space-y-6">
              <StepHeader
                title="Save Recovery Codes"
                subtitle="Shown once. Each works a single time, only after your phone OTP."
              />
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm text-foreground">
                {recoveryCodes.map((c) => (
                  <span key={c} className="tracking-wider">{c}</span>
                ))}
              </div>
              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                Without them, a lost authenticator locks you out permanently.
              </p>
              <Button
                type="button" onClick={copyCodes} variant="outline"
                className="h-11 w-full rounded-lg border-border bg-background text-xs font-bold uppercase tracking-widest text-foreground hover:bg-muted"
              >
                {copied ? <><Check size={14} className="mr-2" />Copied</> : <><Copy size={14} className="mr-2" />Copy Codes</>}
              </Button>
              <Button
                type="button" className={btnPrimary}
                onClick={() => { router.push("/admin"); router.refresh(); }}
              >
                I&apos;ve Saved Them — Enter
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
            <ShieldCheck size={12} className="text-primary" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              OTP + Authenticator MFA
            </p>
          </div>
          <p className="text-center text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </main>
  );
}

// ── Shared step primitives (one visual language across all steps) ────

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-black uppercase tracking-tight text-foreground">{title}</h2>
      <p className="text-[11px] font-medium leading-relaxed text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block px-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function BackLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
    >
      <ArrowLeft size={12} />
      {children}
    </button>
  );
}

function MfaCodeInput({
  value, onChange, icon, inputClass,
}: { value: string; onChange: (v: string) => void; icon: string; inputClass: string }) {
  return (
    <div className="relative">
      <ShieldCheck className={icon} size={18} />
      <Input
        type="text" inputMode="numeric" maxLength={6} autoFocus required
        autoComplete="one-time-code"
        value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder="••••••" className={`${inputClass} text-center tracking-[0.5em]`}
      />
    </div>
  );
}
