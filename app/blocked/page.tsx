import { BlockedContent } from "@/components/shared/blocked-content";
import { Suspense } from "react";

type SearchParams = {
  reason?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function BlockedPage({ searchParams }: Props) {
  const params = await searchParams;
  const reason = params.reason ?? null;

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background selection:bg-primary/20 selection:text-foreground">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ambient Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        
        {/* Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 0)`,
            backgroundSize: '32px 32px' 
          }} 
        />
      </div>

      <Suspense fallback={<div className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">Initializing Shield...</div>}>
        <BlockedContent reason={reason} />
      </Suspense>

      {/* Footer Meta */}
      <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center z-20 hidden md:flex">
        <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Protocol: 429_SECURE</span>
            <div className="h-4 w-[1px] bg-border" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Node: TRK_V1</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 italic">Secure Ecosystem</span>
      </div>
    </main>
  );
}
