import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  title: "TreeKart — Rent a Mango Tree",
  description: "Rent a real Alphonso mango tree on our farm. GPS tracking, 10-day updates, fresh mangoes delivered every season.",
};

import { QueryProvider } from "@/components/providers/query-provider";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <TooltipProvider delay={100}>
            {children}
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}