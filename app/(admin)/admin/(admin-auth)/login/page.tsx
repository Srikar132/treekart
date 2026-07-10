"use client";

import { useState } from "react";
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
import { Turnstile } from "@/components/storefront/auth/turnstile";
import { generateRecoveryCodes, redeemRecoveryCode } from "@/actions/admin-mfa.actions";

type Step = "phone" | "otp" | "mfa-enroll" | "mfa-challenge" | "recovery" | "codes";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

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

    setLoading(true);
    try {
      // shouldCreateUser:false — admins must pre-exist. Supabase returns a distinct
      // error for unknown numbers, so we swallow it: surfacing it would let anyone
      // enumerate which numbers are admins.
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164,
        options: { channel: "sms", shouldCreateUser: false, captchaToken },
      });
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

  const inputClass =
    "h-14 rounded-2xl border-white/5 bg-white/5 pl-12 font-medium text-white placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-orange-500/50";
  const buttonClass =
    "h-14 w-full rounded-2xl border-0 bg-[#E5603E] text-xs font-black uppercase tracking-[0.1em] text-white";

  return (
    <main className="admin-theme dark relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="relative z-10 w-full max-w-[440px] animate-in space-y-8 fade-in zoom-in duration-700">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 rotate-3 items-center justify-center rounded-[24px] border border-white/10 bg-gradient-to-br from-[#E5603E] to-[#C44D2F] shadow-2xl shadow-orange-500/20">
            <TrendingUp className="text-white" size={36} />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
              Admin<span className="text-[#E5603E]">Portal</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              TreeKart Corporate Terminal
            </p>
          </div>
        </div>

        <div className="relative min-w-sm overflow-hidden p-8 md:p-10">
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <FieldLabel>Admin Mobile</FieldLabel>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                <Input
                  type="tel" inputMode="numeric" maxLength={10} required
                  value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="9876543210" className={inputClass}
                />
              </div>
              <Turnstile onVerify={setCaptchaToken} onExpire={() => setCaptchaToken("")} />
              <Button type="submit" disabled={loading} className={buttonClass}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Send OTP"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <FieldLabel>Code sent to {formatE164ForDisplay(toE164(phone) ?? phone)}</FieldLabel>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                <Input
                  type="text" inputMode="numeric" maxLength={6} autoFocus required
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••" className={`${inputClass} text-center tracking-[0.5em]`}
                />
              </div>
              <Button type="submit" disabled={loading} className={buttonClass}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify"}
              </Button>
              <BackLink onClick={() => setStep("phone")}>Change number</BackLink>
            </form>
          )}

          {step === "mfa-enroll" && (
            <form onSubmit={handleVerifyMfa} className="space-y-6">
              <p className="text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Scan with your authenticator app, then enter the code
              </p>
              {qrCode && (
                <div className="flex justify-center rounded-2xl bg-white p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="Authenticator QR code" width={180} height={180} />
                </div>
              )}
              <MfaCodeInput value={mfaCode} onChange={setMfaCode} className={inputClass} />
              <Button type="submit" disabled={loading} className={buttonClass}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Enable & Enter"}
              </Button>
            </form>
          )}

          {step === "mfa-challenge" && (
            <form onSubmit={handleVerifyMfa} className="space-y-6">
              <p className="text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Enter the code from your authenticator app
              </p>
              <MfaCodeInput value={mfaCode} onChange={setMfaCode} className={inputClass} />
              <Button type="submit" disabled={loading} className={buttonClass}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify & Enter"}
              </Button>
              <BackLink onClick={() => setStep("recovery")}>Lost your authenticator?</BackLink>
            </form>
          )}

          {step === "recovery" && (
            <form onSubmit={handleRedeem} className="space-y-6">
              <p className="text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Enter one of your recovery codes
              </p>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                <Input
                  autoFocus required value={recoveryInput}
                  onChange={(e) => setRecoveryInput(e.target.value)}
                  placeholder="XXXXX-XXXXX"
                  className={`${inputClass} text-center tracking-widest uppercase`}
                />
              </div>
              <p className="text-center text-[10px] text-muted-foreground/60">
                This removes your old authenticator. You will set up a new one next.
              </p>
              <Button type="submit" disabled={loading} className={buttonClass}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Use Recovery Code"}
              </Button>
              <BackLink onClick={() => setStep("mfa-challenge")}>Back to authenticator</BackLink>
            </form>
          )}

          {step === "codes" && (
            <div className="space-y-6">
              <p className="text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Save these recovery codes
              </p>
              <p className="text-center text-[10px] leading-relaxed text-muted-foreground/70">
                Shown once. Each works a single time, and only after your phone OTP.
                Without them, a lost authenticator locks you out permanently.
              </p>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-4 font-mono text-sm text-white">
                {recoveryCodes.map((c) => (
                  <span key={c} className="tracking-wider">{c}</span>
                ))}
              </div>
              <Button type="button" onClick={copyCodes} className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 text-xs font-bold uppercase tracking-widest text-white">
                {copied ? <><Check size={14} className="mr-2" />Copied</> : <><Copy size={14} className="mr-2" />Copy codes</>}
              </Button>
              <Button
                type="button"
                className={buttonClass}
                onClick={() => { router.push("/admin"); router.refresh(); }}
              >
                I&apos;ve saved them — Enter
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1.5">
            <ShieldCheck size={12} className="text-green-500" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              OTP + Authenticator MFA
            </p>
          </div>
          <p className="text-center text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </main>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block px-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
      {children}
    </label>
  );
}

function BackLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-white"
    >
      <ArrowLeft size={12} />
      {children}
    </button>
  );
}

function MfaCodeInput({
  value, onChange, className,
}: { value: string; onChange: (v: string) => void; className: string }) {
  return (
    <div className="relative">
      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
      <Input
        type="text" inputMode="numeric" maxLength={6} autoFocus required
        value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder="••••••" className={`${className} text-center tracking-[0.5em]`}
      />
    </div>
  );
}
