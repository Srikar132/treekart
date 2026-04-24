"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { useState } from "react";
import { Play, Video } from "lucide-react";
import Image from "next/image";
import { NoResults } from "@/components/ui/no-results";
import { TreeUpdate } from "@/types/database.types";

// ── YouTube helpers ────────────────────────────────────────────────

function getYouTubeId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

function getYouTubeThumbnail(id: string) {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

// ── YouTube Player ─────────────────────────────────────────────────

function YouTubePlayer({ url, title }: { url: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const videoId = getYouTubeId(url);

  if (!videoId) return null;

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black ring-1 ring-border/40 shadow-lg">
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          {/* Thumbnail */}
          <Image
            src={getYouTubeThumbnail(videoId)}
            alt={title}
            fill
            className="object-cover"
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Play button */}
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 flex items-center justify-center group"
            aria-label="Play video"
          >
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/40 group-hover:scale-110 group-hover:shadow-primary/60 transition-all duration-200">
              <Play size={24} className="text-white fill-white ml-1" />
            </div>
          </button>

          {/* Badge */}
          <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono uppercase tracking-widest">
            <Video size={11} className="text-primary" />
            Farmer Exclusive
          </div>
        </>
      )}
    </div>
  );
}

// ── Update Card ────────────────────────────────────────────────────

function UpdateCard({ update, index }: { update: TreeUpdate; index: number }) {
  const videoId = getYouTubeId(update.video_url);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      className="relative pl-10"
    >
      {/* Timeline dot */}
      <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-sm" />

      <div className="space-y-4">
        {/* Meta */}
        <div className="space-y-1">
          <span className="text-xs font-mono text-primary font-bold tracking-wider">
            {update.posted_at
              ? format(new Date(update.posted_at), "MMMM d, yyyy")
              : "Date TBD"}
          </span>
          <h3 className="text-xl font-bold tracking-tight">
            {update.title || "Update from Farmer"}
          </h3>
          {update.description && (
            <p className="text-muted-foreground leading-relaxed max-w-2xl text-sm">
              {update.description}
            </p>
          )}
        </div>

        {/* Video */}
        {videoId && (
          <div className="max-w-2xl">
            <YouTubePlayer url={update.video_url!} title={update.title || "Farmer Update"} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── TreeUpdates ────────────────────────────────────────────────────

interface TreeUpdatesProps {
  updates: TreeUpdate[];
}

export function TreeUpdates({ updates }: TreeUpdatesProps) {
  if (updates.length === 0) {
    return (
      <section>
        <h2 className="text-3xl font-bold mb-8">Tree Updates</h2>
        <NoResults
          title="No updates yet"
          description="The farmer will post photos and videos once the tree starts its growth cycle."
        />
      </section>
    );
  }

  return (
    <section className="space-y-12">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Growth Journey</h2>
        <p className="text-muted-foreground text-sm">
          Follow the progress of your tree through regular farmer updates.
        </p>
      </div>

      <div className="relative border-l-2 border-primary/20 ml-4 space-y-14 pb-8">
        {updates.map((update, index) => (
          <UpdateCard key={update.id} update={update} index={index} />
        ))}
      </div>
    </section>
  );
}