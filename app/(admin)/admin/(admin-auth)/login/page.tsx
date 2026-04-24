"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatedButton } from "@/components/shared/animated-button";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user is admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Access Denied: Administrative privileges required.");
      }

      toast.success("Welcome back, Administrator.");
      router.push("/admin");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-theme dark min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      {/* Background Orbs for Premium Feel */}
      {/* <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" /> */}
      {/* <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[120px] animate-pulse delay-700" /> */}

      <div className="w-full max-w-[440px] space-y-8 relative z-10 animate-in fade-in zoom-in duration-700">

        {/* Branding */}
        <div className="text-center space-y-4">
          <div className="h-20 w-20 bg-gradient-to-br from-[#E5603E] to-[#C44D2F] mx-auto flex items-center justify-center rounded-[24px] shadow-2xl shadow-orange-500/20 rotate-3 transition-transform hover:rotate-0 duration-500 border border-white/10">
            <TrendingUp className="text-white" size={36} />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
              Admin<span className="text-[#E5603E]">Portal</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="h-[1px] w-8 bg-white/10"></span>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                TreeKart Corporate Terminal
              </p>
              <span className="h-[1px] w-8 bg-white/10"></span>
            </div>
          </div>
        </div>

        {/* Login Card - Glassmorphism */}
        <div className="p-8 md:p-10 min-w-sm  relative overflow-hidden group">
          {/* <div className="absolute i opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" /> */}

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Access Identity</label>
              <div className="relative group/field">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within/field:text-[#E5603E] transition-colors" size={18} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@treekart.in"
                  className="h-14 pl-12 rounded-2xl bg-white/5 border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:bg-white/10 focus-visible:ring-1 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Security Key</label>
              <div className="relative group/field">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within/field:text-[#E5603E] transition-colors" size={18} />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-14 pl-12 rounded-2xl bg-white/5 border-white/5 text-white placeholder:text-muted-foreground/40 focus-visible:bg-white/10 focus-visible:ring-1 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-15 bg-[#E5603E] text-white rounded-2xl font-black uppercase tracking-[0.1em] text-xs shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 border-0"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Initialize Command Center"}
            </Button>
          </form>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Secure AES-256 Link Active
            </p>
          </div>
          <p className="text-center text-[9px] font-medium text-muted-foreground/60 uppercase tracking-[0.2em]">
            Authorized Personnel Only • Node: IN-WEST-01
          </p>
        </div>
      </div>
    </main>
  );
}
