"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/shared/animated-button";

export function AboutClient() {
  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }
  } as const;

  return (
    <main className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-secondary/30">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Image
            src="/images/mango_banner_bg.png"
            alt="Mango Orchard"
            fill
            className="object-cover grayscale-[0.3]"
            priority
          />
          <div className="absolute inset-0 bg-black/10" />
        </motion.div>

        <div className="relative z-10 text-center space-y-6 px-4">
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/90 drop-shadow-sm block"
          >
            Est. 2024
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter drop-shadow-2xl"
          >
            Our Story
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="h-1 w-24 bg-primary mx-auto rounded-full"
          />
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 md:py-32 border-b border-border/50">
        <motion.div
          {...fadeIn}
          className="max-w-4xl mx-auto px-6 text-center space-y-12"
        >
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              The Philosophy
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-foreground uppercase leading-[0.95] tracking-tighter">
              Rooted in tradition,<br />Driven by transparency.
            </h2>
          </div>

          <div className="h-px w-20 bg-primary mx-auto" />

          <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-3xl mx-auto">
            TreeKart was born from a simple realization: the disconnect between the orchard and the consumer was growing too wide. We set out to bridge that gap using technology and a deep respect for organic farming.
          </p>
        </motion.div>
      </section>

      {/* Alternating Grid — Section 1 */}
      <section className="py-24 md:py-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
              className="relative aspect-[4/5] bg-secondary/20 overflow-hidden border border-border/50 group"
            >
              <Image
                src="/images/mango_basket.png"
                alt="Our Orchard"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                  The Orchard
                </span>
                <h3 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none">
                  Cultivating Quality
                </h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our Alphonso orchards are located in the heart of the Konkan belt. Every tree is nurtured with organic compost and monitored with precision. By renting a tree, you become a direct stakeholder in this sustainable cycle.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="space-y-1">
                  <p className="text-3xl font-black text-foreground">100%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Organic Certified</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black text-foreground">500+</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Heritage Trees</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Alternating Grid — Section 2 */}
      <section className="py-24 md:py-40 bg-secondary/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
              className="order-2 md:order-1 space-y-10"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                  The Mission
                </span>
                <h3 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none">
                  A New Harvest<br />Experience
                </h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe that knowing exactly where your food comes from is a luxury that should be accessible. Through real-time GPS tracking and 10-day visual updates, we bring the orchard experience to your phone.
              </p>
              <ul className="space-y-6 pt-4">
                {[
                  "Direct-from-farm delivery",
                  "Ethical harvest practices",
                  "Full digital transparency",
                  "Sustainable waste management"
                ].map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-foreground"
                  >
                    <div className="w-2 h-2 bg-primary" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
              className="order-1 md:order-2 relative aspect-[4/5] bg-secondary/20 overflow-hidden border border-border/50 group"
            >
              <Image
                src="/images/mango_banganapalli.png"
                alt="The Mission"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team/Values Grid */}
      <section className="py-24 md:py-40">
        <div className="max-w-6xl mx-auto px-6 space-y-24">
          <motion.div
            {...fadeIn}
            className="text-center space-y-4"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              Our Values
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tighter">
              The TreeKart Pillars
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-16 md:gap-24">
            {[
              { title: "Trust", desc: "No middle-men. No hidden costs. Every tree has a story you can verify." },
              { title: "Flavor", desc: "Harvested only when naturally ripe. Delivered at peak Brix levels." },
              { title: "Ecology", desc: "Regenerative farming that gives back to the Konkan soil." }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-center space-y-6 group"
              >
                <div className="h-24 w-24 bg-secondary/20 mx-auto flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:rotate-45">
                  <div className="h-2 w-2 bg-primary group-hover:bg-white" />
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-black text-foreground uppercase tracking-tight">{value.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{value.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA/Vision */}
      <section className="py-32 md:py-48 bg-primary text-white text-center">
        <motion.div
          {...fadeIn}
          className="max-w-3xl mx-auto px-6 space-y-12"
        >
          <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Ready to taste the heritage?
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <AnimatedButton 
              href="/store"
              label="Shop Mangoes"
              className="bg-white text-primary border-white h-16 px-12"
              fillClassName="bg-primary"
              hoverTextClassName="hover:text-white"
            />
            <AnimatedButton 
              href="/rent"
              label="Rent a Tree"
              className="border-white text-white h-16 px-12"
              fillClassName="bg-white"
              hoverTextClassName="hover:text-primary"
            />
          </div>
        </motion.div>
      </section>
    </main>
  );
}
