import { adminGetHeroSlides, adminGetTestimonials } from "@/actions/admin.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, MessageSquare, Plus, MoveVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminContentPage() {
  const slides = await adminGetHeroSlides();
  const testimonials = await adminGetTestimonials();

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
            <Button size="sm" variant="outline" className="rounded-lg text-[9px] font-black uppercase tracking-widest border-slate-200">
              <Plus size={12} className="mr-1" /> Add Slide
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {slides.map((slide: any) => (
              <div key={slide.id} className="data-card group">
                <div className="aspect-[21/9] bg-slate-100 rounded-xl overflow-hidden mb-4 relative">
                  <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg shadow-lg">
                      <Edit size={14} />
                    </Button>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="outline" className="mb-2 rounded-md text-[8px] font-black uppercase tracking-widest border-slate-200">
                      Index #{slide.order_index}
                    </Badge>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{slide.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{slide.subtitle}</p>
                  </div>
                  <div className="cursor-ns-resize text-slate-300 hover:text-slate-900 transition-colors">
                    <MoveVertical size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Testimonials Content */}
        <TabsContent value="testimonials" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Reviews ({testimonials.length})</p>
            <Button size="sm" variant="outline" className="rounded-lg text-[9px] font-black uppercase tracking-widest border-slate-200">
              <Plus size={12} className="mr-1" /> Add Review
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t: any) => (
              <div key={t.id} className="data-card relative group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-slate-100 rounded-full shrink-0 overflow-hidden border border-slate-200">
                    {t.avatar_url && <img src={t.avatar_url} alt={t.name} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">{t.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{t.role}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic mb-4">"{t.content}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`h-1.5 w-1.5 rounded-full ${i < t.rating ? 'bg-orange-500' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-slate-300 hover:text-slate-900"><Edit size={14} /></button>
                    <button className="text-slate-300 hover:text-destructive"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
