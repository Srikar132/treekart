"use client";

import { useState } from "react";
import { User, Phone, Mail, ShieldCheck, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { updateProfile } from "@/actions/user.actions";
import { AnimatedButton } from "@/components/shared/animated-button";
import { toast } from "sonner";

interface ProfileSettingsProps {
  user: any;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.full_name || "",
    phone: user.phone || "",
    email: user.email || "", // Email is typically read-only
  });

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
      });
      toast.success("Profile updated successfully.");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Security & Profile</h2>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          Manage your personal information and contact preferences. These details are used for order fulfillment and digital orchard updates.
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-12">
        <div className="grid grid-cols-1 gap-10">
          {/* Full Name */}
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
              <User size={14} className="text-primary" />
              Full Name
            </label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter your full name"
              className="h-16 rounded-2xl border-slate-100 bg-slate-50 px-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus-visible:ring-primary/20 focus-visible:bg-white transition-all shadow-sm"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
              <Phone size={14} className="text-primary" />
              Contact Number
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your mobile number"
              className="h-16 rounded-2xl border-slate-100 bg-slate-50 px-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus-visible:ring-primary/20 focus-visible:bg-white transition-all shadow-sm"
            />
          </div>

          {/* Email — Read Only */}
          <div className="space-y-3 opacity-60">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
              <Mail size={14} className="text-slate-400" />
              Registered Email (Private)
            </label>
            <Input
              value={formData.email}
              readOnly
              className="h-16 rounded-2xl border-slate-100 bg-slate-100 px-6 text-sm font-bold text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>

        <Separator className="bg-slate-100" />

        <div className="space-y-8">
          <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 flex gap-6">
            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
              <ShieldCheck size={24} className="text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Data Encryption</p>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                Your data is protected by industry-standard AES-256 encryption. We never share your personal details with third-party marketers.
              </p>
            </div>
          </div>

          <AnimatedButton
            type="submit"
            disabled={loading}
            label={loading ? "Synchronizing..." : "Update Profile"}
            icon={loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            className="w-full h-16 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 border-transparent transition-transform hover:-translate-y-1"
            fillClassName="bg-white"
            hoverTextClassName="hover:text-primary"
          />
        </div>
      </form>
    </div>
  );
}
