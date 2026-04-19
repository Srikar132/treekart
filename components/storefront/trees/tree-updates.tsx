"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import Image from "next/image";
import { NoResults } from "@/components/ui/no-results";
import { PlayCircle } from "lucide-react";

interface TreeUpdatesProps {
  updates: Array<{
    id: string;
    title: string | null;
    description: string | null;
    photos: any;
    video_url: string | null;
    posted_at: string | null;
  }>;
}

export function TreeUpdates({ updates }: TreeUpdatesProps) {
  if (updates.length === 0) {
    return (
      <div className="">
        <h2 className="text-3xl font-bold mb-8">Tree Updates</h2>
        <NoResults
          title="No updates yet"
          description="The farmer will post photos and videos once the tree starts its growth cycle."
        />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Growth Journey</h2>
        <p className="text-muted-foreground">Follow the progress of your tree through our regular farmer updates.</p>
      </div>

      <div className="relative border-l-2 border-primary/20 ml-4 space-y-16 pb-8">
        {updates.map((update, index) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="relative pl-10"
          >
            {/* Timeline Dot */}
            <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-primary border-4 border-white shadow-sm" />

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-sm font-mono text-primary font-bold">
                  {update.posted_at ? format(new Date(update.posted_at), "MMMM d, yyyy") : "Date TBD"}
                </span>
                <h3 className="text-2xl font-bold tracking-tight">{update.title || "Update from Farmer"}</h3>
                {update.description && (
                  <p className="text-muted-foreground leading-relaxed max-w-3xl">
                    {update.description}
                  </p>
                )}
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Images */}
                {Array.isArray(update.photos) && update.photos.map((photo: string, i: number) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden border">
                    <Image src={photo} alt={`${update.title || 'Update'} photo ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}

                {/* Video */}
                {update.video_url && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border bg-black group">
                    <video
                      src={update.video_url}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      controls
                      poster={Array.isArray(update.photos) ? update.photos[0] : undefined}
                    />
                    {!update.video_url.includes('?') && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                        <PlayCircle size={64} className="text-white/80" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
