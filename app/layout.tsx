import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ReactQueryProvider } from "@/components/layout/react-query-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: { default: "TripSync — AI-Powered Travel Planning", template: "%s | TripSync" },
  description:
    "Plan trips together. Split expenses, generate AI itineraries, and collaborate with friends and family — all in one beautiful app.",
  keywords: ["travel planning", "trip planner", "expense splitting", "AI itinerary", "group travel"],
  openGraph: {
    title: "TripSync — AI-Powered Travel Planning",
    description:
      "Plan trips together with AI itineraries, expense splitting, and real-time collaboration.",
    type: "website",
    siteName: "TripSync",
  },
  twitter: {
    card: "summary_large_image",
    title: "TripSync — AI-Powered Travel Planning",
    description: "Plan trips together with AI itineraries and expense splitting.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
          <Toaster
            position="top-right"
            richColors
            toastOptions={{ style: { borderRadius: "12px", fontFamily: "DM Sans, sans-serif" } }}
          />
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
