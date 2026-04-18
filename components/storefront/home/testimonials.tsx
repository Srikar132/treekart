"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
    {
        name: "Priya Sharma",
        location: "Hyderabad",
        text: "Leasing a mango tree from TreeKart was the best decision! My kids loved watching the video updates of 'our' tree, and the mangoes we received were the sweetest, most organic Banganapallis we've ever had.",
        rating: 5,
    },
    {
        name: "Rahul Verma",
        location: "Bangalore",
        text: "The Corporate Bundle is fantastic. We leased 10 trees for our office. The entire team received fresh boxes of mangoes straight from the farm. The transparency and quality are unmatched.",
        rating: 5,
    },
    {
        name: "Anita Desai",
        location: "Mumbai",
        text: "I've always wanted farm-fresh organic mangoes without the chemical ripening. TreeKart delivered exactly that. Knowing exactly which tree my mangoes came from is such a unique and trustworthy experience.",
        rating: 5,
    },
];

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

export function Testimonials() {
    return (
        <section className="section bg-background relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="container relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="section-header text-center"
                >
                    <h2 className="mb-4">Loved by Mango Enthusiasts</h2>
                    <p className="p-base text-muted-foreground">Don't just take our word for it. Here is what our tree lessors have to say.</p>
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12"
                >
                    {testimonials.map((testimonial, i) => (
                        <motion.div key={i} variants={cardVariants}>
                            <Card className="h-full border-border/50 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                                <CardContent className="p-6 md:p-8 flex flex-col h-full relative">
                                    <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10 rotate-180" />
                                    
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(testimonial.rating)].map((_, j) => (
                                            <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                                        ))}
                                    </div>
                                    
                                    <p className="text-foreground/80 leading-relaxed mb-8 flex-1 italic">
                                        "{testimonial.text}"
                                    </p>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                            {testimonial.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-foreground">{testimonial.name}</h4>
                                            <p className="text-xs text-muted-foreground">{testimonial.location}</p>
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
