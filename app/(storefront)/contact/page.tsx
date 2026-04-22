import { Metadata } from "next";
import { Mail, Phone, MapPin, Globe, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedButton } from "@/components/shared/animated-button";

export const metadata: Metadata = {
  title: "Contact Our Concierge — TreeKart",
  description: "Get in touch with our orchard concierge for questions about tree rentals, bulk orders, or farm visits.",
};

export default function ContactPage() {
  return (
    <main className="bg-white min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-40">
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
                  { icon: Mail, label: "Concierge Email", value: "info@treekart.in" },
                  { icon: Phone, label: "Customer Support", value: "+91 99122 17619 / +91 98480 62600" },
                  { icon: MapPin, label: "The Headquarters", value: "Rajamundry, Andhra Pradesh, India" },
                  { icon: Globe, label: "Web Presence", value: "www.treekart.in" },
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

              <form className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Full Name</label>
                    <Input
                      placeholder="Enter your name"
                      className="h-16 rounded-2xl border-slate-200 bg-white px-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Email Address</label>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      className="h-16 rounded-2xl border-slate-200 bg-white px-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Subject</label>
                  <Input
                    placeholder="What is this about?"
                    className="h-16 rounded-2xl border-slate-200 bg-white px-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-1">Message</label>
                  <Textarea
                    placeholder="How can we help you today?"
                    className="min-h-[220px] rounded-2xl border-slate-200 bg-white p-6 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus-visible:ring-primary/20 focus-visible:border-primary transition-all resize-none"
                  />
                </div>

                <AnimatedButton
                  type="submit"
                  label="Submit Message"
                  icon={<ArrowRight size={18} />}
                  className="w-full h-16 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 border-transparent transition-transform hover:-translate-y-1"
                  fillClassName="bg-white"
                  hoverTextClassName="hover:text-primary"
                />
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Location Map */}
      <section className="h-[60vh] bg-slate-100 relative overflow-hidden grayscale-[0.4] hover:grayscale-0 transition-all duration-[2s] border-t border-slate-200">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61053.49132549298!2d81.73715697669527!3d17.005391307613583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a37a3f9050d5a15%3A0xc6443653199c00b0!2sRajahmundry%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1713560000000!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0"
        />
        <div className="absolute inset-0 pointer-events-none shadow-inner" />
      </section>
    </main>
  );
}
