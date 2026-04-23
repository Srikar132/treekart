// app/admin/content/page.tsx
import { adminGetHeroSlides, adminGetTestimonials } from "@/actions/admin.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HeroSlideCard } from "@/components/admin/content/hero-slide-card";
import { TestimonialCard } from "@/components/admin/content/testimonial-card";
import { HeroSlideForm } from "@/components/admin/content/hero-slide-form";
import { TestimonialForm } from "@/components/admin/content/testimonial-form";

export default async function AdminContentPage() {
  const [slides, testimonials] = await Promise.all([
    adminGetHeroSlides(),
    adminGetTestimonials()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Landing Management</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fine-tune your storefront narrative</p>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-xl mb-8">
          <TabsTrigger value="hero" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-[10px] font-black uppercase tracking-widest gap-2">
            <ImageIcon size={14} /> Hero Slides
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-[10px] font-black uppercase tracking-widest gap-2">
            <MessageSquare size={14} /> Social Proof
          </TabsTrigger>
        </TabsList>

        {/* Hero Slides Content */}
        <TabsContent value="hero" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Slides ({slides.length})</p>
            
            <Dialog>
                <DialogTrigger 
                    render={
                        <Button size="sm" variant="outline" className="rounded-lg text-[9px] font-black uppercase tracking-widest border-slate-200">
                            <Plus size={12} className="mr-1" /> Add Slide
                        </Button>
                    }
                />
                <DialogContent className="max-w-4xl rounded-2xl border-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-black uppercase tracking-tight">Deploy New Hero Story</DialogTitle>
                    </DialogHeader>
                    <HeroSlideForm />
                </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {slides.map((slide: any) => (
              <HeroSlideCard key={slide.id} slide={slide} />
            ))}
          </div>
        </TabsContent>

        {/* Testimonials Content */}
        <TabsContent value="testimonials" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Reviews ({testimonials.length})</p>
            
            <Dialog>
                <DialogTrigger 
                    render={
                        <Button size="sm" variant="outline" className="rounded-lg text-[9px] font-black uppercase tracking-widest border-slate-200">
                            <Plus size={12} className="mr-1" /> Add Review
                        </Button>
                    }
                />
                <DialogContent className="max-w-xl rounded-2xl border-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-black uppercase tracking-tight">Curate Social Proof</DialogTitle>
                    </DialogHeader>
                    <TestimonialForm />
                </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t: any) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
