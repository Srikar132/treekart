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
import { TreePlanForm } from "@/components/admin/content/tree-plan-form";
import { TreePlanCard } from "@/components/admin/content/tree-plan-card";
import { HeroSlidesList } from "@/components/admin/content/hero-slides-list";
import { adminGetTreePlans } from "@/actions/admin.actions";
import { Tag } from "lucide-react";

export default async function AdminContentPage() {
  const [slides, testimonials, treePlans] = await Promise.all([
    adminGetHeroSlides(),
    adminGetTestimonials(),
    adminGetTreePlans()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Landing Management</h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Fine-tune your storefront narrative</p>
      </div>

      <Tabs defaultValue="hero" className="w-full">
      <div className="w-full overflow-x-auto pb-2 -mb-2 scrollbar-hide">
        <TabsList className="bg-muted p-1 rounded-xl mb-8 w-fit min-w-full">
          <TabsTrigger value="hero" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary text-[10px] font-black uppercase tracking-widest gap-2">
            <ImageIcon size={14} /> Hero Slides
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary text-[10px] font-black uppercase tracking-widest gap-2">
            <MessageSquare size={14} /> Social Proof
          </TabsTrigger>
          <TabsTrigger value="plans" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary text-[10px] font-black uppercase tracking-widest gap-2">
            <Tag size={14} /> Pricing Plans
          </TabsTrigger>
        </TabsList>
      </div>

        {/* Hero Slides Content */}
        <TabsContent value="hero" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Slides ({slides.length})</p>

            <Dialog>
              <DialogTrigger
                render={
                  <Button size="sm" variant="outline" className="rounded-lg text-[9px] font-black uppercase tracking-widest border-border">
                    <Plus size={12} className="mr-1" /> Add Slide
                  </Button>
                }
              />
              <DialogContent className="w-full h-full sm:h-auto max-w-none sm:max-w-7xl rounded-none sm:rounded-[2.5rem] border-none sm:border border-border max-h-screen sm:max-h-[95vh] p-6 sm:p-10 overflow-y-auto">
                <DialogHeader className="mb-8">
                  <DialogTitle className="text-xl font-black uppercase tracking-tight">Deploy New Hero Story</DialogTitle>
                </DialogHeader>
                <HeroSlideForm />
              </DialogContent>
            </Dialog>
          </div>

          <HeroSlidesList initialSlides={slides} />
        </TabsContent>

        {/* Testimonials Content */}
        <TabsContent value="testimonials" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Member Reviews ({testimonials.length})</p>

            <Dialog>
              <DialogTrigger
                render={
                  <Button size="sm" variant="outline" className="rounded-lg text-[9px] font-black uppercase tracking-widest border-border">
                    <Plus size={12} className="mr-1" /> Add Review
                  </Button>
                }
              />
              <DialogContent className="w-full h-full sm:h-auto max-w-none sm:max-w-6xl rounded-none sm:rounded-[2.5rem] border-none sm:border border-border max-h-screen sm:max-h-[95vh] p-6 sm:p-10 overflow-y-auto">
                <DialogHeader className="mb-8">
                  <DialogTitle className="text-xl font-black uppercase tracking-tight">Curate Social Proof</DialogTitle>
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

        {/* Tree Plans Content */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pricing Packages ({treePlans.length})</p>

            <Dialog>
              <DialogTrigger
                render={
                  <Button size="sm" variant="outline" className="rounded-lg text-[9px] font-black uppercase tracking-widest border-border">
                    <Plus size={12} className="mr-1" /> Add Plan
                  </Button>
                }
              />
              <DialogContent className="w-full h-full sm:h-auto max-w-none sm:max-w-7xl rounded-none sm:rounded-[2.5rem] border-none sm:border border-border max-h-screen sm:max-h-[95vh] p-6 sm:p-10 overflow-y-auto">
                <DialogHeader className="mb-8">
                  <DialogTitle className="text-xl font-black uppercase tracking-tight">Create Pricing Plan</DialogTitle>
                </DialogHeader>
                <TreePlanForm />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {treePlans.map((plan: any) => (
              <TreePlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
