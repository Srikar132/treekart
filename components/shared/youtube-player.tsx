"use client";

import { useState } from "react";
import { Play, Video } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ── YouTube helpers ────────────────────────────────────────────────

export function getYouTubeId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

export function getYouTubeThumbnail(id: string) {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

// ── YouTube Player ─────────────────────────────────────────────────

interface YouTubePlayerProps {
  url: string;
  title: string;
  className?: string;
  showBadge?: boolean;
}

export function YouTubePlayer({ url, title, className, showBadge = true }: YouTubePlayerProps) {
  const [playing, setPlaying] = useState(false);
  const videoId = getYouTubeId(url);

  if (!videoId) return null;

  return (
    <div className={cn("relative aspect-video rounded-2xl overflow-hidden bg-black ring-1 ring-border/40 shadow-lg", className)}>
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
          title={title}
          className="w-full h-full border-0"
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
            sizes="(max-width: 768px) 100vw, 800px"
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
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/40 group-hover:scale-110 group-hover:shadow-primary/60 transition-all duration-200 text-white">
              <Play size={24} className="fill-white ml-1" />
            </div>
          </button>

          {/* Badge */}
          {showBadge && (
            <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono uppercase tracking-widest">
              <Video size={11} className="text-primary" />
              Farmer Exclusive
            </div>
          )}
        </>
      )}
    </div>
  );
}
