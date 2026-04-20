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
      toast.success("Profile Updated successfully.");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-12">
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Security & Profile</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest leading-relaxed">
          Manage your personal information and contact preferences. These details are used for order fulfillment and tree updates.
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
              <User size={12} className="text-primary" />
              Full Name
            </label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="YOUR FULL NAME"
              className="h-14 rounded-none border-border/60 bg-white px-6 text-xs font-bold tracking-widest uppercase placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
              <Phone size={12} className="text-primary" />
              Contact Number
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 00000 00000"
              className="h-14 rounded-none border-border/60 bg-white px-6 text-xs font-bold tracking-widest uppercase placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
            />
          </div>

          {/* Email — Read Only */}
          <div className="space-y-2 opacity-60">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
              <Mail size={12} className="text-muted-foreground" />
              Registered Email (Private)
            </label>
            <Input
              value={formData.email}
              readOnly
              className="h-14 rounded-none border-border/60 bg-secondary/50 px-6 text-xs font-bold tracking-widest uppercase cursor-not-allowed"
            />
          </div>
        </div>

        <Separator className="bg-border/40" />

        <div className="space-y-6">
          <div className="flex items-start gap-4 p-6 bg-secondary/20 border border-border/40">
            <ShieldCheck size={20} className="text-primary shrink-0" />
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">Data Encryption</p>
              <p className="text-[9px] text-muted-foreground leading-relaxed uppercase tracking-wider">
                Your data is protected by industry-standard AES-256 encryption. We never share your personal details with third-party marketers.
              </p>
            </div>
          </div>

          <AnimatedButton
            type="submit"
            disabled={loading}
            label={loading ? "Synchronizing..." : "Update Details"}
            icon={loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            className="w-full h-16 bg-primary text-white font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-primary/10 border-transparent"
            fillClassName="bg-white"
            hoverTextClassName="hover:text-primary"
          />
        </div>
      </form>
    </div>
  );
}
