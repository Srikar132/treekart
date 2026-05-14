import type { Metadata } from "next";
import { DM_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Script from "next/script";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { LoginPromptDialog } from "@/components/shared/login-prompt-dialog";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const dmMono = Bricolage_Grotesque({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.treekart.in"),
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <NextTopLoader color="var(--primary)" showSpinner={false} />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <TooltipProvider delay={100}>
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "TreeKart",
                    "url": "https://www.treekart.in",
                    "logo": "https://www.treekart.in/logo.webp",
                    "contactPoint": {
                      "@type": "ContactPoint",
                      "telephone": "+91-7981365932",
                      "contactType": "customer service"
                    },
                    "sameAs": [
                      "https://facebook.com/treekart",
                      "https://twitter.com/treekart",
                      "https://instagram.com/treekart"
                    ]
                  })
                }}
              />
              {children}
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
        <Toaster />
        <LoginPromptDialog />

        <Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}