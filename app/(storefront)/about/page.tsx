import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us — TreeKart",
  description: "Learn about our mission to bring fresh, organic Alphonso mangoes from our orchards to your doorstep.",
};

export default function AboutPage() {
  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-secondary/30">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/mango_banner_bg.png" // Placeholder, user will replace
            alt="Mango Orchard"
            fill
            className="object-cover opacity-60 grayscale-[0.3]"
            priority
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="relative z-10 text-center space-y-4 px-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/80 drop-shadow-sm">
            Est. 2024
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
            Our Story
          </h1>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 md:py-32 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              The Philosophy
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-foreground uppercase leading-[0.9] tracking-tighter">
              Rooted in tradition,<br />Driven by transparency.
            </h2>
          </div>

          <div className="h-px w-20 bg-primary mx-auto" />

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
            TreeKart was born from a simple realization: the disconnect between the orchard and the consumer was growing too wide. We set out to bridge that gap using technology and a deep respect for organic farming.
          </p>
        </div>
      </section>

      {/* Alternating Grid — Section 1 */}
      <section className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="relative aspect-[4/5] bg-secondary/20 overflow-hidden border border-border/50">
              <Image
                src="/images/mango_basket.png"
                alt="Our Orchard"
                fill
                className="object-cover transition-transform duration-1000 hover:scale-105"
              />
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                  The Orchard
                </span>
                <h3 className="text-4xl font-black text-foreground uppercase tracking-tight leading-none">
                  Cultivating Quality
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Our Alphonso orchards are located in the heart of the Konkan belt. Every tree is nurtured with organic compost and monitored with precision. By renting a tree, you become a direct stakeholder in this sustainable cycle.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <p className="text-2xl font-black text-foreground">100%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Organic Certified</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">500+</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Heritage Trees</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternating Grid — Section 2 */}
      <section className="py-20 md:py-32 bg-secondary/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="order-2 md:order-1 space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                  The Mission
                </span>
                <h3 className="text-4xl font-black text-foreground uppercase tracking-tight leading-none">
                  A New Harvest<br />Experience
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We believe that knowing exactly where your food comes from is a luxury that should be accessible. Through real-time GPS tracking and 10-day visual updates, we bring the orchard experience to your phone.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  "Direct-from-farm delivery",
                  "Ethical harvest practices",
                  "Full digital transparency",
                  "Sustainable waste management"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-foreground">
                    <div className="w-1 h-1 bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 md:order-2 relative aspect-[4/5] bg-secondary/20 overflow-hidden border border-border/50">
              <Image
                src="/images/mango_banganapalli.png"
                alt="The Mission"
                fill
                className="object-cover transition-transform duration-1000 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team/Values Grid */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 space-y-20">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              Our Values
            </span>
            <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter">
              The TreeKart Pillars
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            {[
              { title: "Trust", desc: "No middle-men. No hidden costs. Every tree has a story you can verify." },
              { title: "Flavor", desc: "Harvested only when naturally ripe. Delivered at peak Brix levels." },
              { title: "Ecology", desc: "Regenerative farming that gives back to the Konkan soil." }
            ].map((value) => (
              <div key={value.title} className="text-center space-y-4 group">
                <div className="h-16 w-16 bg-secondary/20 mx-auto flex items-center justify-center transition-colors group-hover:bg-primary/10">
                  <div className="h-1.5 w-1.5 bg-primary" />
                </div>
                <h4 className="text-xl font-black text-foreground uppercase tracking-tight">{value.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
