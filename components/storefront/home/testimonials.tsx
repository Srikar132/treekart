"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface TestimonialsProps {
    testimonials: any[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
};

export function Testimonials({ testimonials: initialTestimonials }: TestimonialsProps) {
    const testimonials = initialTestimonials?.length > 0 ? initialTestimonials : [
        {
            name: "Priya Sharma",
            role: "Orchard Member",
            content: "Leasing a mango tree from TreeKart was the best decision! My kids loved watching the video updates of 'our' tree, and the mangoes we received were the sweetest.",
            rating: 5,
        },
        {
            name: "Rahul Verma",
            role: "Premium Subscriber",
            content: "The Corporate Bundle is fantastic. We leased 10 trees for our office. The entire team received fresh boxes of mangoes straight from the farm.",
            rating: 5,
        },
        {
            name: "Anita Desai",
            role: "Harvest Club",
            content: "I've always wanted farm-fresh organic mangoes without the chemical ripening. TreeKart delivered exactly that. Knowing exactly which tree my mangoes came from is such a unique experience.",
            rating: 5,
        },
    ];

    return (
        <section className="section relative overflow-hidden bg-slate-50/50">
            <div className="container relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4">Loved by Enthusiasts</h2>
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Direct from our community of orchard members</p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {testimonials.map((testimonial, i) => (
                        <motion.div key={i} variants={cardVariants}>
                            <Card className="h-full border-slate-100 bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 rounded-[2rem] overflow-hidden group">
                                <CardContent className="p-8 md:p-10 flex flex-col h-full relative">
                                    <Quote className="absolute top-10 right-10 w-12 h-12 text-slate-50 group-hover:text-primary/5 transition-colors" />

                                    <div className="flex gap-1 mb-8">
                                        {[...Array(5)].map((_, j) => (
                                            <Star 
                                                key={j} 
                                                size={14} 
                                                className={j < (testimonial.rating || 5) ? "fill-orange-400 text-orange-400" : "text-slate-100"} 
                                            />
                                        ))}
                                    </div>

                                    <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-10 flex-1 font-medium italic">
                                        "{testimonial.content || testimonial.text}"
                                    </p>

                                    <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 shrink-0">
                                            {testimonial.avatar_url ? (
                                                <img src={testimonial.avatar_url} alt={testimonial.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xs uppercase">
                                                    {testimonial.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xs text-slate-900 uppercase tracking-tight">{testimonial.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{testimonial.role || testimonial.location}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
