"use client";

import * as React from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ShareDialogProps {
  url?: string;
  title?: string;
  trigger?: React.ReactNode;
}

export function ShareDialog({
  url,
  title = "Share this link",
  trigger
}: ShareDialogProps) {
  const [copied, setCopied] = React.useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialPlatforms = [
    {
      name: "Whatsapp",
      icon: <FaWhatsapp size={18} />,
      href: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
      color: "hover:text-green-600 border-green-100 hover:border-green-600",
    },
    {
      name: "Instagram",
      icon: <FaInstagram size={18} />,
      href: `https://www.instagram.com/`, // Instagram doesn't have a direct share URL for web
      color: "hover:text-pink-600 border-pink-100 hover:border-pink-600",
    },
    {
      name: "Facebook",
      icon: <FaFacebookF size={18} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "hover:text-blue-600 border-blue-100 hover:border-blue-600",
    },
    {
      name: "X",
      icon: <FaXTwitter size={18} />,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
      color: "hover:text-black border-gray-100 hover:border-black",
    }
  ];

  return (
    <Dialog>
      <DialogTrigger
        render={
          React.isValidElement(trigger) ? (
            trigger
          ) : trigger ? (
            <span className="inline-block">{trigger}</span>
          ) : (
            <Button variant="outline" size="icon" className="rounded-full" />
          )
        }
      >
        {!trigger && <Share2 className="w-4 h-4" />}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl p-5">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Copy link</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 pt-4">
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                id="link"
                defaultValue={shareUrl}
                readOnly
                className="h-12 rounded-lg bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <TooltipProvider>
              <Tooltip open={copied}>
                <TooltipTrigger
                  render={
                    <Button
                      type="submit"
                      size="icon"
                      variant="outline"
                      onClick={handleCopy}
                      className="h-12 w-12 rounded-lg shrink-0 border-muted hover:bg-primary hover:text-white transition-all duration-300"
                    />
                  }
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-primary text-white border-none font-bold">
                  <p>Copied!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Share</p>
            <div className="flex items-center gap-4">
              {socialPlatforms.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 text-muted-foreground",
                    platform.color
                  )}
                >
                  {platform.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
