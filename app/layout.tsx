import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ReactQueryProvider } from "@/components/layout/react-query-provider";

export const metadata: Metadata = {
  title: { default: "TripSync — AI-Powered Travel Planning", template: "%s | TripSync" },
  description: "Plan trips together. AI itineraries, expense splitting, and real-time collaboration.",
  keywords: ["travel planning", "trip planner", "expense splitting", "AI itinerary"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ background: "#080810" }}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              style: {
                background: "#13131f",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.9)",
                fontFamily: "Inter, sans-serif",
                borderRadius: "12px",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
