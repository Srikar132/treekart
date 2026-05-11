"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { useState } from "react";
import { Play, Video } from "lucide-react";
import Image from "next/image";
import { NoResults } from "@/components/ui/no-results";
import { TreeUpdate } from "@/types/database.types";

import { YouTubePlayer } from "@/components/shared/youtube-player";

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