"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatedButton } from "@/components/shared/animated-button";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

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
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="w-full max-w-[440px] space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Branding */}
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-[#E5603E] mx-auto flex items-center justify-center rounded-2xl shadow-xl shadow-orange-500/20 rotate-3 transition-transform hover:rotate-0 duration-500">
            <TrendingUp className="text-white" size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
              Admin<span className="text-[#E5603E]">Portal</span>
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              TreeKart Corporate Terminal
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 md:p-10 rounded-[24px] shadow-2xl shadow-slate-200 border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#E5603E] transition-colors" size={18} />
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@treekart.in"
                  className="h-14 pl-12 rounded-xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-orange-500/10 focus-visible:border-orange-500/20 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#E5603E] transition-colors" size={18} />
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-14 pl-12 rounded-xl bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-orange-500/10 focus-visible:border-orange-500/20 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <AnimatedButton 
              type="submit"
              disabled={loading}
              label={loading ? "Authenticating..." : "Enter Command Center"}
              icon={loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
              className="w-full h-14 bg-[#E5603E] text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/30"
              fillClassName="bg-white"
              hoverTextClassName="hover:text-[#E5603E]"
            />
          </form>
        </div>

        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Authorized Personnel Only • Secure 256-bit AES
        </p>
      </div>
    </main>
  );
}
