"use client";

import { useActionState, useEffect } from "react";
import { Mail, Phone, MapPin, Globe, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedButton } from "@/components/shared/animated-button";
import settings from "@/constants/settings";
import { toast } from "sonner";
import { ContactFormState } from "@/lib/validations";
import { submitContactForm } from "@/actions/contact.actions";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState<ContactFormState, FormData>(
    submitContactForm,
    {}
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Message sent! Our concierge will get back to you shortly.");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-32">
      {/* LEFT — Info */}
      <div className="lg:col-span-5 space-y-20">
        <div className="space-y-6">
          <span className="inline-block text-xs font-black uppercase tracking-[0.4em] text-primary bg-primary/5 px-4 py-1">
            Reach Out
          </span>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            Get in Touch
          </h2>
          <p className="text-lg text-slate-500 font-medium max-w-sm">
            Have questions about our orchards or tree rentals? Our concierge team is here to help.
          </p>
        </div>

        <div className="space-y-16">
          <div className="space-y-10">
            {[
              { icon: Mail, label: "Concierge Email", value: settings.EMAIL },
              { icon: Phone, label: "Customer Support", value: settings.PHONE },
              { icon: MapPin, label: "The Headquarters", value: settings.ADDRESS },
              { icon: Globe, label: "Web Presence", value: settings.WEB || "www.treekart.in" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-8 group">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 transition-all group-hover:bg-primary group-hover:text-white shadow-sm border border-slate-100">
                  <Icon size={20} className="transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                  <p className="text-lg font-black text-slate-900 tracking-tight break-words">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="h-1.5 w-24 bg-primary rounded-full" />

          <div className="space-y-6">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Follow Our Harvest</p>
            <div className="flex gap-6">
              {["Instagram", "X"].map((social) => (
                <button key={social} className="text-sm font-black uppercase tracking-widest text-slate-900 hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">
                  {social}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="lg:col-span-7">
        <div className="bg-slate-50 rounded-[3rem] p-8 md:p-16 space-y-12 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

          <div className="space-y-4 relative z-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Send a message</h2>
            <p className="text-sm text-slate-500 font-medium">Expected response time is 2–4 business hours.</p>
          </div>

          {state.success ? (
            <div className="relative z-10 py-12 flex flex-col items-center text-center space-y-6 bg-white rounded-3xl border border-primary/10 shadow-sm animate-in fade-in zoom-in duration-500">
              <div className="h-20 w-20 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Message Received</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">
                  Thank you for reaching out. Our concierge team has been notified and will contact you soon.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-xs font-black uppercase tracking-widest text-primary hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form action={formAction} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Full Name</label>
                  <Input
                    name="name"
                    required
                    placeholder="Enter your name"
                    className="h-16 rounded-2xl border-slate-200 bg-white px-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                  />
                  {state.fieldErrors?.name && (
                    <p className="text-[10px] text-destructive font-bold px-1">{state.fieldErrors.name[0]}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Email Address</label>
                  <Input
                    name="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="h-16 rounded-2xl border-slate-200 bg-white px-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                  />
                  {state.fieldErrors?.email && (
                    <p className="text-[10px] text-destructive font-bold px-1">{state.fieldErrors.email[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Subject</label>
                <Input
                  name="subject"
                  required
                  placeholder="What is this about?"
                  className="h-16 rounded-2xl border-slate-200 bg-white px-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                />
                {state.fieldErrors?.subject && (
                  <p className="text-[10px] text-destructive font-bold px-1">{state.fieldErrors.subject[0]}</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Message</label>
                <Textarea
                  name="message"
                  required
                  placeholder="How can we help you today?"
                  className="min-h-[220px] rounded-2xl border-slate-200 bg-white p-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus-visible:ring-primary/20 focus-visible:border-primary transition-all resize-none"
                />
                {state.fieldErrors?.message && (
                  <p className="text-[10px] text-destructive font-bold px-1">{state.fieldErrors.message[0]}</p>
                )}
              </div>

              <AnimatedButton
                type="submit"
                disabled={isPending}
                label={isPending ? "Sending..." : "Submit Message"}
                icon={isPending ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                className="w-full h-16 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 border-transparent transition-transform hover:-translate-y-1"
                fillClassName="bg-white"
                hoverTextClassName="hover:text-primary"
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
