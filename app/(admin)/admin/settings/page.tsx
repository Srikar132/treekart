import { Settings, Shield, Bell, Cloud, Globe, Lock, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">System Settings</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global platform configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation / Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest bg-white border border-slate-200 rounded-xl text-primary shadow-sm shadow-primary/5">
            <Shield size={16} /> Security & Roles
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors">
            <Globe size={16} /> Localization
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors">
            <Cloud size={16} /> API Integrations
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors">
            <Bell size={16} /> Notifications
          </button>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-8">
          
          <div className="data-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 bg-blue-100 flex items-center justify-center rounded-lg text-blue-600">
                <Shield size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Platform Security</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase">Two-Factor Authentication</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Require 2FA for all administrative accounts</p>
                </div>
                <Badge variant="outline" className="bg-white text-green-600 border-green-200 uppercase text-[8px] px-3 py-1">Enforced</Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Superuser Recovery Email</label>
                  <Input 
                    type="email" 
                    placeholder="recovery@treekart.in" 
                    defaultValue="root@treekart.in"
                    className="h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-primary/20 text-xs font-bold" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="data-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 bg-orange-100 flex items-center justify-center rounded-lg text-orange-600">
                <Cloud size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">External Core Services</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Razorpay Environment</label>
                  <Badge variant="outline" className="h-12 w-full flex items-center justify-center rounded-xl bg-slate-50 border-slate-100 text-[10px] font-black text-slate-600">PRODUCTION MODE</Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Cloudinary Status</label>
                  <Badge variant="outline" className="h-12 w-full flex items-center justify-center rounded-xl bg-green-50 border-green-100 text-[10px] font-black text-green-600 uppercase tracking-widest">Active & Verified</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="ghost" className="h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
              Discard Changes
            </Button>
            <Button className="admin-button-primary h-12 px-8 shadow-lg shadow-primary/20 text-[10px] font-black uppercase tracking-widest">
              <Save size={16} className="mr-2" />
              Save Configuration
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
}
