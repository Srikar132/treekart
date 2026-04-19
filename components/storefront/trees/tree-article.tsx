"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";

interface TreeArticleProps {
  content: string | null;
}

export function TreeArticle({ content }: TreeArticleProps) {
  if (!content) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="prose prose-stone lg:prose-xl max-w-none dark:prose-invert"
    >
      <div>
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
      </div>
    </motion.section>
  );
}
