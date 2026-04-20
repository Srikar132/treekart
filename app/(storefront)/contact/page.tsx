import { Metadata } from "next";
import { Mail, Phone, MapPin, Globe, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedButton } from "@/components/shared/animated-button";

export const metadata: Metadata = {
  title: "Contact Us — TreeKart",
  description: "Get in touch with our orchard concierge for questions about tree rentals, bulk orders, or farm visits.",
};

export default function ContactPage() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
          
          {/* LEFT — Info */}
          <div className="lg:col-span-5 space-y-16">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
                Reach Out
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-foreground uppercase tracking-tighter leading-none">
                Get In<br />Touch
              </h1>
            </div>

            <div className="space-y-12">
              <div className="space-y-6">
                {[
                  { icon: Mail, label: "Concierge Email", value: "info@treekart.in" },
                  { icon: Phone, label: "Customer Support", value: "+91 99122 17619 / +91 98480 62600" },
                  { icon: MapPin, label: "The HQ", value: "Rajamundry, Andhra Pradesh, India" },
                  { icon: Globe, label: "Web Presence", value: "www.treekart.in" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-6 group">
                    <div className="h-12 w-12 bg-secondary/20 flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary/10">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                      <p className="text-sm font-bold text-foreground uppercase tracking-tight">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px w-20 bg-primary" />

              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Follow Our Harvest</p>
                <div className="flex gap-4">
                  {["Instagram", "X"].map((social) => (
                    <button key={social} className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">
                      {social}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="lg:col-span-7">
            <div className="bg-secondary/5 p-8 md:p-12 space-y-10 border border-border/40">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Send a Message</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Expected response time: 2–4 hours</p>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Full Name</label>
                    <Input 
                      placeholder="JOHN DOE"
                      className="h-14 rounded-none border-border/60 bg-white px-6 text-xs font-bold tracking-widest uppercase placeholder:text-muted-foreground/40 focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Email Address</label>
                    <Input 
                      type="email"
                      placeholder="JOHN@EXAMPLE.COM"
                      className="h-14 rounded-none border-border/60 bg-white px-6 text-xs font-bold tracking-widest uppercase placeholder:text-muted-foreground/40 focus-visible:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Subject</label>
                  <Input 
                    placeholder="GENERAL ENQUIRY"
                    className="h-14 rounded-none border-border/60 bg-white px-6 text-xs font-bold tracking-widest uppercase placeholder:text-muted-foreground/40 focus-visible:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Message</label>
                  <Textarea 
                    placeholder="HOW CAN WE HELP YOU?"
                    className="min-h-[200px] rounded-none border-border/60 bg-white p-6 text-xs font-bold tracking-widest uppercase placeholder:text-muted-foreground/40 focus-visible:ring-primary/20 resize-none"
                  />
                </div>

                <AnimatedButton 
                  type="submit"
                  label="Submit Message"
                  icon={<ArrowRight size={16} />}
                  className="w-full h-16 bg-primary text-white font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-primary/10 border-transparent"
                  fillClassName="bg-white"
                  hoverTextClassName="hover:text-primary"
                />
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Location Map */}
      <section className="h-[50vh] bg-secondary/20 relative overflow-hidden grayscale opacity-70 hover:grayscale-0 transition-all duration-1000">
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
        <div className="absolute inset-0 pointer-events-none border-t border-border/40" />
      </section>
    </main>
  );
}
