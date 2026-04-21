"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 text-center font-sans">
          <div className="rounded-full bg-red-50 p-5">
            <AlertTriangle size={36} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-sm max-w-sm">
              {error.message ?? "An unexpected error occurred. Please try again."}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={reset} variant="outline">Try Again</Button>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
